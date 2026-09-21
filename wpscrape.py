#!/usr/bin/env python3
"""
wpscrape.py - automated WordPress -> static HTML/CSS/JS mirror.

Runs the whole pipeline from a single URL:
  recon -> URL discovery -> pilot check -> mirror -> fixups -> verify -> report

Usage:
    ./wpscrape.py https://example.com
    ./wpscrape.py "$URL" --out ./sites --delay 1.5
    ./wpscrape.py "$URL" --render            # headless browser for JS-rendered sites
    ./wpscrape.py "$URL" --discover-only     # just build urls.txt and stop

Requires: python3, wget. Optional: playwright (only for --render).
"""

import argparse
import gzip
import json
import ssl
import os
import re
import shutil
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from collections import deque
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse, urlsplit, urlunsplit
from urllib.request import Request, urlopen

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

SITEMAP_CANDIDATES = [
    "/wp-sitemap.xml",
    "/sitemap_index.xml",
    "/sitemap.xml",
    "/sitemap-index.xml",
    "/wp-sitemap-index.xml",
    "/page-sitemap.xml",
]

SKIP_PATH_RE = re.compile(
    r"(/wp-admin/|/wp-login|/wp-json/|/xmlrpc\.php|/feed/?$|/comments/feed|"
    r"\?replytocom=|/wp-content/uploads/.*\.(zip|pdf|docx?|xlsx?|mp4|mp3)$)", re.I)

ASSET_EXT_RE = re.compile(
    r"\.(css|js|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|eot|mp4|webm|mp3|"
    r"zip|gz|pdf|docx?|xlsx?|csv|xml|json|txt)$", re.I)

# Hosts that typically appear only inside CSS/JS, never in the HTML, so the pilot
# scan cannot spot them. Whitelisted so --page-requisites can actually fetch them.
DEFAULT_ASSET_HOSTS = {
    "fonts.googleapis.com", "fonts.gstatic.com",
    "cdnjs.cloudflare.com", "cdn.jsdelivr.net", "unpkg.com",
    "ajax.googleapis.com", "code.jquery.com",
    "use.fontawesome.com", "maxcdn.bootstrapcdn.com",
    "secure.gravatar.com", "i0.wp.com", "i1.wp.com", "i2.wp.com", "s.w.org",
}

# Hosts whose content must stay remote - embeds and trackers, not assets.
KEEP_REMOTE_HOSTS = {
    "www.youtube.com", "youtube.com", "youtu.be", "www.youtube-nocookie.com",
    "player.vimeo.com", "vimeo.com", "w.soundcloud.com",
    "www.google.com", "maps.google.com", "www.google-analytics.com",
    "www.googletagmanager.com", "connect.facebook.net", "www.facebook.com",
    "platform.twitter.com", "www.instagram.com",
}

LOG_LINES = []
PROV = {}          # url -> set of source labels ("posts-post-1", "rest:posts")


def tag_source(url, label):
    PROV.setdefault(url, set()).add(label)


# SSL handling: verify by default, fall back to unverified once if the chain is
# broken (very common with misconfigured intermediates). wget already runs with
# --no-check-certificate, so this keeps both stages consistent.
SSL_STATE = {"insecure": False, "strict": False, "warned": False}


def ssl_context(insecure):
    if not insecure:
        ctx = ssl.create_default_context()
        try:
            import certifi
            ctx.load_verify_locations(certifi.where())
        except ImportError:
            pass
        return ctx
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


# ---------------------------------------------------------------- utilities

def log(msg, level="info"):
    prefix = {"info": "  ", "ok": "  \033[32m+\033[0m ", "warn": "  \033[33m!\033[0m ",
              "err": "  \033[31mx\033[0m "}.get(level, "  ")
    line = f"{prefix}{msg}"
    print(line, flush=True)
    LOG_LINES.append(re.sub(r"\033\[\d+m", "", line).strip())


def phase(n, title):
    print(f"\n\033[1m[{n}] {title}\033[0m", flush=True)
    LOG_LINES.append(f"[{n}] {title}")


def fetch(url, timeout=25, max_bytes=8_000_000):
    """GET a URL. Returns (status, headers_dict, bytes) or (None, {}, b'')."""
    req = Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    })
    for attempt in (1, 2):
        try:
            ctx = ssl_context(SSL_STATE["insecure"])
            with urlopen(req, timeout=timeout, context=ctx) as r:
                data = r.read(max_bytes)
                if r.headers.get("Content-Encoding") == "gzip" or url.endswith(".gz"):
                    try:
                        data = gzip.decompress(data)
                    except Exception:
                        pass
                return r.status, dict(r.headers), data
        except HTTPError as e:
            return e.code, dict(e.headers or {}), b""
        except (URLError, TimeoutError, OSError) as e:
            cert_problem = isinstance(getattr(e, "reason", None), ssl.SSLCertVerificationError) \
                or "CERTIFICATE_VERIFY_FAILED" in str(e)
            if cert_problem and attempt == 1 and not SSL_STATE["strict"]:
                SSL_STATE["insecure"] = True
                if not SSL_STATE["warned"]:
                    SSL_STATE["warned"] = True
                    log("certificate chain could not be verified - continuing without "
                        "TLS verification (content is public HTML; see --strict-ssl)", "warn")
                continue
            if cert_problem and SSL_STATE["strict"]:
                log(f"certificate verification failed for {url} (--strict-ssl is on)", "err")
            else:
                log(f"fetch failed {url}: {e}", "warn")
            return None, {}, b""
    return None, {}, b""


def normalise(url):
    """Canonical form: drop fragment, drop tracking-ish empty query, keep case of path."""
    try:
        s = urlsplit(url.strip())
    except ValueError:
        return None
    if s.scheme not in ("http", "https"):
        return None
    path = re.sub(r"/{2,}", "/", s.path) or "/"
    return urlunsplit((s.scheme, s.netloc.lower(), path, s.query, ""))


def host_variants(netloc):
    bare = netloc[4:] if netloc.startswith("www.") else netloc
    return {bare, "www." + bare}


def same_site(url, hosts):
    try:
        return urlsplit(url).netloc.lower() in hosts
    except ValueError:
        return False


def is_page(url):
    p = urlsplit(url).path
    if SKIP_PATH_RE.search(url):
        return False
    if ASSET_EXT_RE.search(p):
        return False
    return True


# ------------------------------------------------------------------- recon

def recon(base):
    info = {"is_wordpress": False, "themes": [], "plugins": [], "server": "",
            "cdn": "", "protected": False, "robots_sitemaps": [], "wp_version": ""}

    status, headers, body = fetch(base)
    if status is None:
        log("could not reach the site at all - check the URL and your network", "err")
        info["unreachable"] = True
        return info, None
    if status >= 400 and status not in (403, 503):
        log(f"root URL returned HTTP {status} - is this the right entry point?", "warn")
    log(f"HTTP {status} from {base}")

    info["server"] = headers.get("Server", "")
    for k in headers:
        if k.lower().startswith("cf-") or "cloudflare" in headers.get(k, "").lower():
            info["cdn"] = "cloudflare"
    if "sucuri" in str(headers).lower():
        info["cdn"] = info["cdn"] or "sucuri"
    if info["server"]:
        log(f"server: {info['server']}" + (f" (cdn: {info['cdn']})" if info["cdn"] else ""))

    html = body.decode("utf-8", "replace")
    if status in (403, 503) and re.search(r"cf-browser-verification|challenge-platform|"
                                          r"Just a moment|Attention Required", html, re.I):
        info["protected"] = True
        log("bot protection challenge detected - plain fetching will not work", "err")

    info["themes"] = sorted(set(re.findall(r"wp-content/themes/([^/\"'?]+)", html)))
    info["plugins"] = sorted(set(re.findall(r"wp-content/plugins/([^/\"'?]+)", html)))
    m = re.search(r'name="generator" content="WordPress ([\d.]+)', html)
    if m:
        info["wp_version"] = m.group(1)
    info["is_wordpress"] = bool(info["themes"] or info["plugins"] or info["wp_version"]
                                or "wp-content" in html or "wp-json" in html)

    if info["is_wordpress"]:
        bits = []
        if info["wp_version"]:
            bits.append(f"WordPress {info['wp_version']}")
        if info["themes"]:
            bits.append("theme: " + ", ".join(info["themes"][:3]))
        if info["plugins"]:
            bits.append(f"{len(info['plugins'])} plugins detected")
        log("; ".join(bits) or "WordPress markers present", "ok")
    else:
        log("no WordPress markers found - continuing as a generic site", "warn")

    _, _, rb = fetch(urljoin(base, "/robots.txt"))
    for line in rb.decode("utf-8", "replace").splitlines():
        if line.lower().startswith("sitemap:"):
            sm = normalise(line.split(":", 1)[1])
            if sm:
                info["robots_sitemaps"].append(sm)
    if info["robots_sitemaps"]:
        log(f"robots.txt lists {len(info['robots_sitemaps'])} sitemap(s)", "ok")

    return info, html


# ---------------------------------------------------------------- discovery

def from_sitemaps(base, seeds, hosts, delay, cap):
    """Walk sitemap indexes recursively. Returns set of page URLs."""
    found, seen, queue = set(), set(), deque()
    for s in seeds:
        queue.append(s)
    for c in SITEMAP_CANDIDATES:
        queue.append(urljoin(base, c))

    checked = 0
    while queue and len(found) < cap and checked < 200:
        sm = queue.popleft()
        if sm in seen:
            continue
        seen.add(sm)
        status, _, body = fetch(sm)
        checked += 1
        if status != 200 or not body.strip():
            continue
        try:
            root = ET.fromstring(body)
        except ET.ParseError:
            continue
        tag = root.tag.split("}")[-1]
        locs = [e.text.strip() for e in root.iter() if e.tag.split("}")[-1] == "loc" and e.text]
        if tag == "sitemapindex":
            log(f"sitemap index {sm} -> {len(locs)} child sitemaps", "ok")
            queue.extend(locs)
        else:
            urls = {u for u in (normalise(l) for l in locs)
                    if u and same_site(u, hosts) and is_page(u)}
            label = re.sub(r"^(wp-)?sitemap-?|\.xml$", "", urlsplit(sm).path.split("/")[-1]) \
                or "sitemap"
            for u in urls:
                tag_source(u, label)
            if urls:
                log(f"{sm} -> {len(urls)} urls", "ok")
            found |= urls
        time.sleep(delay * 0.3)
    return found


def from_rest_api(base, hosts, delay, cap):
    """Enumerate every public post type through /wp-json/wp/v2/."""
    found = set()
    types = ["pages", "posts"]

    status, _, body = fetch(urljoin(base, "/wp-json/wp/v2/types"))
    if status == 200:
        try:
            data = json.loads(body)
            rests = []
            for t in data.values():
                r = t.get("rest_base") or ""
                if r and t.get("visibility", {}).get("public", True) is not False:
                    rests.append(r)
            if rests:
                types = sorted(set(rests) - {"media", "blocks", "nav_menu_item",
                                             "wp_template", "wp_template_part",
                                             "wp_global_styles", "wp_navigation"})
                log(f"REST post types: {', '.join(types)}", "ok")
        except (ValueError, AttributeError):
            pass

    for t in types:
        page, got = 1, 0
        while page <= 50 and len(found) < cap:
            u = urljoin(base, f"/wp-json/wp/v2/{t}?per_page=100&page={page}&_fields=link")
            status, headers, body = fetch(u)
            if status != 200:
                break
            try:
                items = json.loads(body)
            except ValueError:
                break
            if not isinstance(items, list) or not items:
                break
            for it in items:
                link = normalise(it.get("link", "")) if isinstance(it, dict) else None
                if link and same_site(link, hosts) and is_page(link):
                    found.add(link)
                    tag_source(link, f"rest:{t}")
                    got += 1
            total_pages = int(headers.get("X-WP-TotalPages") or 0)
            if total_pages and page >= total_pages:
                break
            if len(items) < 100:
                break
            page += 1
            time.sleep(delay * 0.5)
        if got:
            log(f"rest:{t} -> {got} urls", "ok")
    return found


def from_feed(base, hosts):
    found = set()
    for path in ("/feed/", "/?feed=rss2"):
        status, _, body = fetch(urljoin(base, path))
        if status != 200:
            continue
        for m in re.finditer(r"<link[^>]*>([^<]+)</link>|<link>([^<]+)</link>",
                             body.decode("utf-8", "replace")):
            u = normalise(m.group(1) or m.group(2) or "")
            if u and same_site(u, hosts) and is_page(u):
                found.add(u)
    if found:
        log(f"feed -> {len(found)} urls", "ok")
    return found


def from_wayback(base, hosts, cap):
    host = urlsplit(base).netloc
    u = ("http://web.archive.org/cdx/search/cdx?url=" + host +
         "*&output=text&fl=original&collapse=urlkey&filter=statuscode:200&limit=" + str(cap))
    status, _, body = fetch(u, timeout=45)
    if status != 200:
        log("wayback lookup failed", "warn")
        return set()
    found = {n for n in (normalise(l) for l in body.decode("utf-8", "replace").splitlines())
             if n and same_site(n, hosts) and is_page(n)}
    log(f"wayback -> {len(found)} historical urls", "ok")
    return found


def crawl_links(base, hosts, delay, cap, max_depth=4):
    """Last-resort BFS link crawl of the live site."""
    seen, found = {normalise(base)}, set()
    queue = deque([(normalise(base), 0)])
    while queue and len(found) < cap:
        url, depth = queue.popleft()
        status, headers, body = fetch(url)
        if status != 200 or "html" not in headers.get("Content-Type", "text/html"):
            continue
        found.add(url)
        if depth >= max_depth:
            continue
        html = body.decode("utf-8", "replace")
        for href in re.findall(r'href=["\']([^"\'#]+)', html):
            nxt = normalise(urljoin(url, href))
            if nxt and nxt not in seen and same_site(nxt, hosts) and is_page(nxt):
                seen.add(nxt)
                queue.append((nxt, depth + 1))
        time.sleep(delay)
    log(f"link crawl -> {len(found)} urls", "ok")
    return found



def url_groups(urls):
    """Cluster URLs by their first path segment so bulk sections are visible."""
    from collections import Counter
    c = Counter()
    for u in urls:
        parts = [x for x in urlsplit(u).path.split("/") if x]
        c["/" + parts[0] + "/" if parts else "(root)"] += 1
    return c.most_common()


def depth(u):
    return len([x for x in urlsplit(u).path.split("/") if x])


def source_groups(urls):
    from collections import Counter
    c = Counter()
    for u in urls:
        for lbl in PROV.get(u, {"unknown"}):
            c[lbl] += 1
    return c.most_common()


def _by_source(urls, pattern):
    pat = re.compile(pattern, re.I)
    return [u for u in urls if any(pat.search(l) for l in PROV.get(u, ()))]


def apply_filters(urls, include, exclude, samples, auto_sample, drop_pagination,
                  only_source=(), exclude_source=(), sample_source=()):
    """include -> exclude -> pagination -> per-pattern sampling -> auto sampling."""
    stats = {"start": len(urls)}
    urls = list(urls)

    for pattern in only_source:
        keep = set(_by_source(urls, pattern))
        log(f"--only-source {pattern!r}: kept {len(keep)} of {len(urls)}", "ok")
        urls = [u for u in urls if u in keep]

    for pattern in exclude_source:
        drop = set(_by_source(urls, pattern))
        log(f"--exclude-source {pattern!r}: dropped {len(drop)} urls", "ok")
        urls = [u for u in urls if u not in drop]

    for spec in sample_source:
        if "=" not in spec:
            log(f"ignoring malformed --sample-source {spec!r}", "warn")
            continue
        pattern, n_s = spec.rsplit("=", 1)
        try:
            n = int(n_s)
        except ValueError:
            log(f"ignoring malformed --sample-source {spec!r}", "warn")
            continue
        matched = sorted(_by_source(urls, pattern), key=lambda u: (depth(u), u))
        if not matched:
            log(f"--sample-source {pattern!r} matched nothing", "warn")
            continue
        keep = set(matched[:n])
        urls = [u for u in urls if u not in set(matched) or u in keep]
        log(f"--sample-source {pattern!r}: kept {len(keep)} of {len(matched)}", "ok")

    if include:
        pats = [re.compile(p, re.I) for p in include]
        urls = [u for u in urls if any(p.search(u) for p in pats)]
        stats["after_include"] = len(urls)

    if exclude:
        pats = [re.compile(p, re.I) for p in exclude]
        kept = [u for u in urls if not any(p.search(u) for p in pats)]
        log(f"--exclude dropped {len(urls) - len(kept)} urls", "ok")
        urls = kept

    if drop_pagination:
        pag = re.compile(r"(/page/\d+/?$|[?&]paged?=\d+)", re.I)
        kept = [u for u in urls if not pag.search(u)]
        if len(kept) != len(urls):
            log(f"--no-pagination dropped {len(urls) - len(kept)} paged urls", "ok")
        urls = kept

    for spec in samples:
        if "=" not in spec:
            log(f"ignoring malformed --sample {spec!r} (expected REGEX=N)", "warn")
            continue
        pat_s, n_s = spec.rsplit("=", 1)
        try:
            n = int(n_s)
        except ValueError:
            log(f"ignoring malformed --sample {spec!r} (N must be a number)", "warn")
            continue
        pat = re.compile(pat_s, re.I)
        matched = sorted([u for u in urls if pat.search(u)], key=lambda u: (depth(u), u))
        if not matched:
            log(f"--sample {pat_s!r} matched nothing", "warn")
            continue
        keep = set(matched[:n])
        urls = [u for u in urls if u not in set(matched) or u in keep]
        log(f"--sample {pat_s!r}: kept {len(keep)} of {len(matched)} "
            f"({', '.join(urlsplit(k).path for k in sorted(keep, key=depth))})", "ok")

    if auto_sample:
        from collections import defaultdict
        groups = defaultdict(list)
        for u in urls:
            parts = [x for x in urlsplit(u).path.split("/") if x]
            groups["/" + parts[0] + "/" if parts else "(root)"].append(u)
        keep = set()
        for g, members in groups.items():
            ordered = sorted(members, key=lambda u: (depth(u), u))
            keep.update(ordered[:auto_sample])
            if len(members) > auto_sample:
                log(f"--auto-sample {g}: {len(members)} -> {auto_sample}", "ok")
        urls = [u for u in urls if u in keep]

    stats["end"] = len(urls)
    return sorted(set(urls)), stats


def discover(base, info, hosts, delay, cap, use_wayback):
    urls, sources = set(), {}

    sm = from_sitemaps(base, info["robots_sitemaps"], hosts, delay, cap)
    sources["sitemap"] = len(sm)
    urls |= sm

    rest = from_rest_api(base, hosts, delay, cap)
    sources["rest_api"] = len(rest)
    urls |= rest

    if len(urls) < 5:
        f = from_feed(base, hosts)
        sources["feed"] = len(f)
        urls |= f

    if len(urls) < 5:
        log("structured sources came up empty - falling back to a link crawl", "warn")
        c = crawl_links(base, hosts, delay, cap)
        sources["crawl"] = len(c)
        urls |= c

    if use_wayback:
        w = from_wayback(base, hosts, cap)
        sources["wayback"] = len(w)
        urls |= w

    urls.add(normalise(base))
    urls = {u for u in urls if u}
    return sorted(urls), sources


# ------------------------------------------------------------------- pilot

def pilot(urls, hosts):
    """Fetch a few pages and work out whether wget alone will be enough."""
    verdict = {"js_rendered": False, "lazy_images": 0, "extra_hosts": set(),
               "text_ratio": 0.0, "blocked": False}
    sample = urls[:5]
    ratios = []
    for u in sample:
        status, headers, body = fetch(u)
        if status in (403, 429, 503):
            verdict["blocked"] = True
            log(f"{status} on {u}", "err")
            continue
        if status != 200:
            continue
        html = body.decode("utf-8", "replace")

        stripped = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", html)
        text = re.sub(r"(?s)<[^>]+>", " ", stripped)
        text = re.sub(r"\s+", " ", text).strip()
        ratios.append(len(text) / max(len(html), 1))

        verdict["lazy_images"] += len(re.findall(r"data-(?:src|srcset|lazy-src)=", html))
        for m in re.finditer(r'(?:src|href)=["\'](https?://([^/"\']+))', html):
            h = m.group(2).lower()
            if h not in hosts:
                verdict["extra_hosts"].add(h)

        if re.search(r'<div id="(root|app|__next)"\s*>\s*</div>', html):
            verdict["js_rendered"] = True

    if not ratios:
        verdict["no_samples"] = True
        log(f"none of the {len(sample)} sampled pages fetched successfully", "err")
        return verdict

    verdict["text_ratio"] = round(sum(ratios) / len(ratios), 4)
    if verdict["text_ratio"] < 0.015:
        verdict["js_rendered"] = True

    log(f"sampled {len(ratios)}/{len(sample)} pages, text-to-markup ratio "
        f"{verdict['text_ratio']:.3f}")
    if verdict["js_rendered"]:
        log("pages look JS-rendered - use --render or content will be missing", "warn")
    else:
        log("server-rendered HTML looks complete", "ok")
    if verdict["lazy_images"]:
        log(f"{verdict['lazy_images']} lazy-loaded image attributes found (will be rewritten)",
            "warn")
    if verdict["extra_hosts"]:
        log("external asset hosts: " + ", ".join(sorted(verdict["extra_hosts"])[:6]), "info")
    return verdict


# ------------------------------------------------------------------ mirror

def mirror_wget(urls_file, out_dir, hosts, extra_hosts, delay, rate, tries):
    domains = ",".join(sorted(hosts | extra_hosts))
    cmd = [
        "wget",
        f"--input-file={urls_file}",
        "--force-directories",
        "--page-requisites",
        "--convert-links",
        "--adjust-extension",
        "--restrict-file-names=windows",
        "--span-hosts", f"--domains={domains}",
        f"--wait={delay}", "--random-wait",
        f"--tries={tries}", "--timeout=30",
        f"--user-agent={UA}",
        "-e", "robots=off",
        "--no-check-certificate",
        "-P", str(out_dir),
        "-o", str(out_dir / "wget.log"),
    ]
    if rate:
        cmd.insert(1, f"--limit-rate={rate}")

    log("running wget (this is the slow part)")
    t0 = time.time()
    rc = subprocess.run(cmd).returncode
    elapsed = int(time.time() - t0)

    logtext = (out_dir / "wget.log").read_text("utf-8", "replace") \
        if (out_dir / "wget.log").exists() else ""
    saved = len(re.findall(r"^Saving to:|saved \[", logtext, re.M))
    errors = re.findall(r"ERROR (\d+)", logtext)
    log(f"wget exited {rc} after {elapsed}s; ~{saved} files saved", "ok" if rc in (0, 8) else "warn")
    if errors:
        from collections import Counter
        log("http errors: " + ", ".join(f"{k}x{v}" for k, v in Counter(errors).items()), "warn")
    return {"returncode": rc, "seconds": elapsed, "files_saved": saved,
            "http_errors": len(errors)}


def mirror_render(urls, out_dir, delay, site_root=None):
    """Headless-browser render pass for JS-heavy sites."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        log("playwright not installed. run:  pip install playwright && playwright install chromium",
            "err")
        return {"rendered": 0, "failed": len(urls), "skipped": True}

    # Write over the mirrored HTML inside the served root when we know it, so the
    # rendered DOM goes through the fixup stages and the result can be served.
    # Falls back to a separate folder only if the root could not be determined.
    root = site_root if site_root is not None else (out_dir / "rendered")
    ok = bad = 0
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch()
        except Exception as e:
            if "Executable doesn't exist" in str(e) or "playwright install" in str(e):
                log("the Chromium binary is not installed. run:", "err")
                log("    py -m playwright install chromium", "info")
            else:
                log(f"could not launch Chromium: {str(e)[:150]}", "err")
            return {"rendered": 0, "failed": len(urls), "skipped": True}
        ctx = browser.new_context(user_agent=UA, viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        for i, u in enumerate(urls, 1):
            try:
                # networkidle never settles on pages that keep a connection open
                # (analytics, preloaders, long-polling), and that is exactly what
                # happens on busy home pages. Fall back to a laxer condition and
                # give the JS a fixed grace period instead of waiting for silence.
                strategy = "networkidle"
                try:
                    page.goto(u, wait_until="networkidle", timeout=45000)
                except Exception as e:
                    if "Timeout" not in str(e):
                        raise
                    strategy = "domcontentloaded"
                    page.goto(u, wait_until="domcontentloaded", timeout=60000)
                    try:
                        page.wait_for_load_state("load", timeout=20000)
                    except Exception:
                        pass
                    page.wait_for_timeout(4000)
                    log(f"{u} needed the lax wait ({strategy})", "warn")

                # let lazy content and masonry/salvattore layout run
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(1800)
                page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
                page.wait_for_timeout(800)
                page.evaluate("window.scrollTo(0, 0)")
                page.wait_for_timeout(600)
                html = page.content()
                rel = urlsplit(u).path.strip("/")
                dest = (root / "index.html") if not rel else (
                    root / rel if rel.endswith(".html") else root / rel / "index.html")
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_text(html, encoding="utf-8")
                ok += 1
                if i % 10 == 0 or i == len(urls):
                    log(f"rendered {i}/{len(urls)}")
            except Exception as e:
                bad += 1
                log(f"render failed {u}: {str(e)[:80]}", "warn")
            time.sleep(delay)
        browser.close()
    log(f"rendered {ok} pages, {bad} failures -> {root}", "ok")
    return {"rendered": ok, "failed": bad, "skipped": False}


# ------------------------------------------------------------------ fixups

def fixups(root, hosts):
    html_files = list(root.rglob("*.html")) + list(root.rglob("*.htm"))
    css_files = list(root.rglob("*.css"))
    counts = {"files": len(html_files), "lazy_rewritten": 0, "absolute_rewritten": 0}

    # trailing / is optional so both scheme://host/path and scheme://host work
    host_re = re.compile(r"https?://(?:" + "|".join(re.escape(h) for h in hosts) + r")/?")
    # Divi and other plugins embed URLs inside JS strings with escaped slashes:
    #   var file = ["https:\/\/petrik.hu\/wp-content\/et-cache\/2\/x.css"]
    # The plain host_re above never matches those, so they keep pointing at the
    # live site. Rewrite them to a root-relative escaped path.
    esc_host_re = re.compile(
        r"https?:\\/\\/(?:" + "|".join(re.escape(h) for h in hosts) + r")\\/")

    def prefix_for(f):
        """'../../' style prefix so the result also works over file:// and in subdirs."""
        depth = len(f.relative_to(root).parts) - 1
        return "../" * depth if depth else ""

    for f in html_files:
        try:
            txt = f.read_text("utf-8", "replace")
        except OSError:
            continue
        orig = txt

        txt, n1 = re.subn(r'\bdata-(?:lazy-)?src=(["\'])', r'src=\1', txt)
        txt, n2 = re.subn(r'\bdata-(?:lazy-)?srcset=(["\'])', r'srcset=\1', txt)
        txt, n3 = re.subn(r'\bdata-bg(?:-image)?=(["\'])', r'data-bg-done=\1', txt)
        counts["lazy_rewritten"] += n1 + n2 + n3

        # leftover absolute self-links wget missed (inline <style>, JS strings, srcset)
        txt, n4 = host_re.subn(prefix_for(f), txt)
        counts["absolute_rewritten"] += n4

        # escaped-slash variants inside JS string literals
        esc_prefix = prefix_for(f).replace("/", "\\/")
        txt, n5 = esc_host_re.subn(esc_prefix, txt)
        counts["escaped_rewritten"] = counts.get("escaped_rewritten", 0) + n5

        if txt != orig:
            f.write_text(txt, encoding="utf-8")

    for f in css_files:
        try:
            txt = f.read_text("utf-8", "replace")
        except OSError:
            continue
        new, n = host_re.subn(prefix_for(f), txt)
        if n:
            counts["absolute_rewritten"] += n
            f.write_text(new, encoding="utf-8")

    log(f"rewrote {counts['lazy_rewritten']} lazy-load attrs, "
        f"{counts['absolute_rewritten']} absolute "
        f"(+{counts.get('escaped_rewritten', 0)} escaped) self-references across "
        f"{counts['files']} html + {len(css_files)} css files", "ok")
    return counts


# ------------------------------------------------------------------ verify



REF_RE = re.compile(r'((?:src|href|data-src)=["\']|url\(["\']?)([^"\'()\s]+)')

# Bare quoted asset paths, e.g. inside an inline-JS array of script URLs that
# REF_RE cannot see because there is no src=/href= lead-in.
ASSET_STR_RE = re.compile(
    r'(["\'])((?:[^"\'()\s]+)\.(?:js|css|png|jpe?g|gif|webp|svg|woff2?|ttf|eot)'
    r'(?:\?[^"\'\s]*)?)\1')


def iter_refs(txt):
    """Every asset-ish reference in a file: attribute refs, url(), bare strings."""
    for lead, ref in REF_RE.findall(txt):
        yield lead, ref
    for _q, ref in ASSET_STR_RE.findall(txt):
        yield "", ref


def _local_candidates(raw):
    """Filenames wget may have used for a URL path with a query string.

    The last two cover icon fonts, which Divi declares as
    url(modules.eot?#iefix) and url(modules.woff?ver=4.27.8): an empty or
    dropped query means wget often saved the bare filename instead.
    """
    mangled = raw.replace("?", "@", 1)
    cands = [raw, mangled, mangled + ".css", mangled + ".html", mangled + ".js"]
    if "?" in raw:
        bare = raw.split("?")[0]
        cands += [bare, bare + ".css"]
    return cands


def resolve_on_disk(base_dir, probe):
    """Find the file wget actually wrote for a reference.

    Handles both mangling directions:
      ref foo.js?ver=1  -> file foo.js@ver=1        (query mangled into the name)
      ref foo.css       -> file foo.css@ver=123.css (ref has no query, file does,
                           which is what Divi's JS-built URLs hit)
    """
    for cand in _local_candidates(probe):
        t = base_dir / cand
        if t.exists():
            return t, cand
    # reverse case: look for <name>@... beside the requested name
    t = base_dir / probe
    parent, name = t.parent, t.name
    if name and parent.is_dir():
        matches = sorted(parent.glob(name + "@*"))
        if matches:
            return matches[0], None
    return None, None


def fix_query_refs(root, hosts):
    """Point ?ver=... refs at the @ver=... files wget actually wrote to disk.
    wget only converts refs it parsed itself; anything emitted from inline JS
    (Divi dynamic assets, preloader plugins) keeps the original query string."""
    fixed, unresolved = 0, set()

    for f in (list(root.rglob("*.html")) + list(root.rglob("*.htm"))
              + list(root.rglob("*.css")) + list(root.rglob("*.js"))):
        try:
            txt = f.read_text("utf-8", "replace")
        except OSError:
            continue

        def repair(m):
            nonlocal fixed
            lead, ref = m.group(1), m.group(2)
            if ref.startswith(("http://", "https://", "//", "data:", "#",
                               "mailto:", "tel:", "javascript:")):
                return m.group(0)
            raw = ref.split("#")[0]
            base_dir = root if raw.startswith("/") else f.parent
            probe = raw.lstrip("/") if raw.startswith("/") else raw
            target, cand = resolve_on_disk(base_dir, probe)
            if target is not None:
                if cand == raw:
                    return m.group(0)              # already correct
                newref = os.path.relpath(target.resolve(), f.parent).replace(os.sep, "/")
                fixed += 1
                return f"{lead}{newref}"
            if "?" in raw or ASSET_EXT_RE.search(raw.split("?")[0]):
                unresolved.add((str(f.relative_to(root)), raw))
            return m.group(0)

        def repair_str(m):
            nonlocal fixed
            q, ref = m.group(1), m.group(2)
            # Divi builds URLs inside JS string literals with escaped slashes:
            #   var file = ["wp-content\/et-cache\/2\/et-divi-dynamic-2-late.css"]
            # Those must be unescaped before they can be resolved on disk, and
            # re-escaped when written back.
            escaped = "\\/" in ref
            raw = ref.split("#")[0].replace("\\/", "/")
            if raw.startswith(("http://", "https://", "//", "data:")):
                return m.group(0)
            base_dir = root if raw.startswith("/") else f.parent
            probe = raw.lstrip("/") if raw.startswith("/") else raw
            target, cand = resolve_on_disk(base_dir, probe)
            if target is not None:
                if cand == probe and not escaped:
                    return m.group(0)
                fixed += 1
                newref = os.path.relpath(target.resolve(), f.parent).replace(os.sep, "/")
                if escaped:
                    newref = newref.replace("/", "\\/")
                return f"{q}{newref}{q}"
            unresolved.add((str(f.relative_to(root)), raw))
            return m.group(0)

        new = REF_RE.sub(repair, txt)
        new = ASSET_STR_RE.sub(repair_str, new)
        if new != txt:
            f.write_text(new, encoding="utf-8")

    log(f"repointed {fixed} query-string refs at their on-disk filenames", "ok")
    if unresolved:
        try:
            (root.parent / "unresolved-assets.txt").write_text(
                "\n".join(f"{src}\t{ref}" for src, ref in sorted(unresolved)) + "\n",
                encoding="utf-8")
            log("full list written to unresolved-assets.txt", "info")
        except OSError:
            pass
    if unresolved:
        log(f"{len(unresolved)} referenced assets are not on disk at all "
            f"(use --fetch-missing to download them)", "warn")
    return {"repointed": fixed, "unresolved": len(unresolved),
            "unresolved_sample": sorted({r for _, r in unresolved})[:20]}


def fetch_missing(root, base, out_dir, hosts, extra_hosts, delay, tries):
    """Second wget pass for assets referenced only from inline JS, which
    --page-requisites never saw."""
    wanted = set()
    for f in (list(root.rglob("*.html")) + list(root.rglob("*.htm"))
              + list(root.rglob("*.css")) + list(root.rglob("*.js"))):
        try:
            txt = f.read_text("utf-8", "replace")
        except OSError:
            continue
        # URL of the directory this file represents, for resolving relative refs
        rel_dir = f.relative_to(root).parent.as_posix()
        file_url = urljoin(base, "" if rel_dir == "." else rel_dir + "/")
        for _lead, ref in iter_refs(txt):
            if ref.startswith(("http://", "https://", "//", "data:", "#",
                               "mailto:", "tel:", "javascript:")):
                continue
            # JS string literals escape their slashes ("a\/b\/c.css"); without
            # unescaping, the URL we build is malformed and the file is never
            # fetched. This is how Divi's per-page et-cache CSS goes missing.
            raw = ref.split("#")[0].replace("\\/", "/")
            if raw.startswith(("http://", "https://", "//")):
                continue
            if not raw or not ASSET_EXT_RE.search(raw.split("?")[0]):
                continue
            base_dir = root if raw.startswith("/") else f.parent
            probe = raw.lstrip("/") if raw.startswith("/") else raw
            if resolve_on_disk(base_dir, probe)[0] is not None:
                continue
            wanted.add(urljoin(file_url, raw))

    wanted = {u for u in wanted if same_site(u, hosts)}
    if not wanted:
        log("no missing assets to fetch", "ok")
        return {"requested": 0, "after": 0}

    listing = out_dir / "missing-assets.txt"
    listing.write_text("\n".join(sorted(wanted)) + "\n", encoding="utf-8")
    log(f"fetching {len(wanted)} assets that were never downloaded", "ok")

    cmd = ["wget", f"--input-file={listing}", "--force-directories",
           "--adjust-extension", "--restrict-file-names=windows",
           "--span-hosts", f"--domains={','.join(sorted(hosts | extra_hosts))}",
           f"--wait={delay}", "--random-wait", f"--tries={tries}", "--timeout=30",
           f"--user-agent={UA}", "-e", "robots=off", "--no-check-certificate",
           "-P", str(out_dir), "-a", str(out_dir / "wget-missing.log")]
    rc = subprocess.run(cmd).returncode
    log(f"second pass exited {rc}", "ok" if rc in (0, 8) else "warn")
    return {"requested": len(wanted), "returncode": rc}


NOT_A_HOST_SUFFIX = {
    "php", "html", "htm", "js", "css", "json", "xml", "txt", "asp", "aspx",
    "cgi", "pl", "py", "rb", "jsp", "do", "png", "jpg", "jpeg", "gif", "svg",
    "webp", "ico", "woff", "woff2", "ttf", "eot", "pdf", "zip", "map",
}


def looks_like_host(seg):
    """'fonts.gstatic.com' yes; 'xmlrpc.php' and 'style.css' no."""
    if not re.match(r"^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9-]+)+$", seg):
        return False
    return seg.rsplit(".", 1)[-1] not in NOT_A_HOST_SUFFIX


def undo_bad_relink(root):
    """Repair refs an earlier version wrongly turned into https://<filename>/."""
    bad = re.compile(r'https?://((?:[a-z0-9-]+\.)+(?:' +
                     "|".join(sorted(NOT_A_HOST_SUFFIX)) + r'))/?', re.I)
    fixed = 0
    for f in (list(root.rglob("*.html")) + list(root.rglob("*.htm"))
              + list(root.rglob("*.css"))):
        try:
            txt = f.read_text("utf-8", "replace")
        except OSError:
            continue
        new, n = bad.subn(lambda m: m.group(1), txt)
        if n:
            fixed += n
            f.write_text(new, encoding="utf-8")
    if fixed:
        log(f"reverted {fixed} refs wrongly rewritten as hostnames", "ok")
    return fixed




def follow_links(site_root, base, out_dir, hosts, extra_hosts, delay, tries,
                 hops=1, cap=400, exclude=()):
    """Close the link graph: download internal pages that the mirrored HTML links
    to but which never made it onto disk (nav items missing from the sitemap,
    posts skipped by sampling)."""
    ex = [re.compile(p, re.I) for p in exclude]
    link_re = re.compile(r'href=["\']([^"\'#]+)')
    stats = {"hops": [], "fetched_total": 0}

    for hop in range(1, hops + 1):
        missing = set()
        for f in list(site_root.rglob("*.html")) + list(site_root.rglob("*.htm")):
            rel_dir = f.relative_to(site_root).parent.as_posix()
            file_url = urljoin(base, "" if rel_dir == "." else rel_dir + "/")
            try:
                txt = f.read_text("utf-8", "replace")
            except OSError:
                continue
            for href in link_re.findall(txt):
                if href.startswith(("data:", "mailto:", "tel:", "javascript:")):
                    continue
                # wget rewrites links it did NOT download back to absolute URLs,
                # so those are exactly the ones worth looking at here.
                if href.startswith(("http://", "https://", "//")):
                    abs_url = normalise(urljoin(base, href) if href.startswith("//")
                                        else href)
                    if not abs_url or not same_site(abs_url, hosts):
                        continue
                    raw = urlsplit(abs_url).path
                    base_dir, probe = site_root, raw.lstrip("/")
                else:
                    raw = href.split("?")[0]
                    base_dir = site_root if raw.startswith("/") else f.parent
                    probe = raw.lstrip("/") if raw.startswith("/") else raw
                if ASSET_EXT_RE.search(raw):
                    continue
                local = base_dir / probe if probe else base_dir
                if local.exists() or (local / "index.html").exists() \
                        or (probe and local.with_suffix(".html").exists()):
                    continue
                url = normalise(urljoin(file_url, href))
                if not url or not same_site(url, hosts) or not is_page(url):
                    continue
                if any(p.search(url) for p in ex):
                    continue
                missing.add(url)

        if not missing:
            log(f"hop {hop}: link graph is closed, nothing missing", "ok")
            break

        picked = sorted(missing)[:cap]
        log(f"hop {hop}: {len(missing)} linked pages missing, fetching {len(picked)}"
            + (f" (capped by --max-follow)" if len(missing) > cap else ""), "ok")
        listing = out_dir / f"follow-hop{hop}.txt"
        listing.write_text("\n".join(picked) + "\n", encoding="utf-8")

        cmd = ["wget", f"--input-file={listing}", "--force-directories",
               "--page-requisites", "--convert-links", "--adjust-extension",
               "--restrict-file-names=windows", "--span-hosts",
               f"--domains={','.join(sorted(hosts | extra_hosts))}",
               f"--wait={delay}", "--random-wait", f"--tries={tries}",
               "--timeout=30", f"--user-agent={UA}", "-e", "robots=off",
               "--no-check-certificate", "-P", str(out_dir),
               "-a", str(out_dir / "wget-follow.log")]
        rc = subprocess.run(cmd).returncode
        stats["hops"].append({"hop": hop, "missing": len(missing),
                              "fetched": len(picked), "returncode": rc})
        stats["fetched_total"] += len(picked)

    return stats


def consolidate_external_assets(out_dir, site_root):
    """Move cross-host asset dirs INSIDE the served root and fix the refs.

    wget --force-directories writes each host to its own top-level directory, so
    fonts.gstatic.com/ ends up as a sibling of petrik.hu/ rather than inside it.
    Refs then point above the served root with ../../../.. and 404. Move those
    directories in, then repoint every ref that escaped the root.
    """
    if out_dir.resolve() == site_root.resolve():
        return {"moved": [], "repointed": 0}

    moved = []
    for child in sorted(out_dir.iterdir()):
        if not child.is_dir() or child.resolve() == site_root.resolve():
            continue
        if not looks_like_host(child.name.lower()):
            continue
        dest = site_root / child.name
        if dest.exists():
            for src in child.rglob("*"):
                if src.is_file():
                    tgt = dest / src.relative_to(child)
                    tgt.parent.mkdir(parents=True, exist_ok=True)
                    if not tgt.exists():
                        shutil.move(str(src), str(tgt))
            shutil.rmtree(child, ignore_errors=True)
        else:
            shutil.move(str(child), str(dest))
        moved.append(child.name)

    if moved:
        log(f"moved external asset dirs inside the served root: {', '.join(moved)}", "ok")

    # repoint refs that resolved above the root
    root_res, out_res = site_root.resolve(), out_dir.resolve()
    repointed = 0
    for f in (list(site_root.rglob("*.html")) + list(site_root.rglob("*.htm"))
              + list(site_root.rglob("*.css"))):
        try:
            txt = f.read_text("utf-8", "replace")
        except OSError:
            continue

        def repair(m):
            nonlocal repointed
            lead, ref = m.group(1), m.group(2)
            if ref.startswith(("http://", "https://", "//", "data:", "#",
                               "mailto:", "tel:", "javascript:")) or "../" not in ref:
                return m.group(0)
            raw = ref.split("#")[0]
            target = (f.parent / raw).resolve()
            try:                       # inside the root already? leave alone
                target.relative_to(root_res)
                return m.group(0)
            except ValueError:
                pass
            try:                       # above the root: reinterpret inside it
                rel = target.relative_to(out_res)
            except ValueError:
                return m.group(0)
            moved_target = root_res / rel
            if not moved_target.exists():
                return m.group(0)
            repointed += 1
            newref = os.path.relpath(moved_target, f.parent).replace(os.sep, "/")
            return f"{lead}{newref}"

        new = REF_RE.sub(repair, txt)
        if new != txt:
            f.write_text(new, encoding="utf-8")

    if repointed:
        log(f"repointed {repointed} refs that pointed above the served root", "ok")
    return {"moved": moved, "repointed": repointed}


def relink_missing_externals(root, hosts):
    """wget rewrites cross-host refs to local paths even when it never downloaded
    the file (excluded host, embed, redirect). Point those back at the real URL,
    undoing --restrict-file-names / --adjust-extension mangling on the way."""
    ref_re = re.compile(r'((?:src|href|data-src)=["\']|url\(["\']?)([^"\'()]+)')
    repaired, hosts_seen = 0, set()

    for f in list(root.rglob("*.html")) + list(root.rglob("*.htm")) + \
             list(root.rglob("*.css")):
        try:
            txt = f.read_text("utf-8", "replace")
        except OSError:
            continue

        def repair(m):
            nonlocal repaired
            lead, ref = m.group(1), m.group(2)
            if ref.startswith(("http://", "https://", "//", "data:", "#",
                               "mailto:", "tel:", "javascript:")):
                return m.group(0)
            base_dir = root if ref.startswith("/") else f.parent
            target = (base_dir / ref.split("#")[0].lstrip("/")).resolve()
            if target.exists() or (target / "index.html").exists():
                return m.group(0)
            try:
                rel = target.relative_to(root.resolve())
            except ValueError:
                return m.group(0)
            parts = rel.parts
            if not parts:
                return m.group(0)
            host = parts[0].lower()
            if host in hosts or not looks_like_host(host):
                return m.group(0)   # a genuinely missing local file, leave it
            rest = "/".join(parts[1:])
            if "=" in rest and "@" in rest:        # ? was mangled to @
                rest = rest.replace("@", "?", 1)
                rest = re.sub(r"\.(html?|css|js)$", "", rest)
            repaired += 1
            hosts_seen.add(host)
            return f"{lead}https://{host}/{rest}"

        new = ref_re.sub(repair, txt)
        if new != txt:
            f.write_text(new, encoding="utf-8")

    if repaired:
        log(f"relinked {repaired} refs back to remote hosts "
            f"({', '.join(sorted(hosts_seen)[:5])})", "ok")
    return {"relinked": repaired, "hosts": sorted(hosts_seen)}


def strip_wp_scripts(root):
    """Remove only genuinely dead WordPress scripts, identified by src.

    Deliberately does NOT touch inline <script> blocks. Themes such as Divi put
    their whole runtime config (et_pb_custom, slider settings, image paths) in an
    inline block that also contains the admin-ajax URL; deleting it breaks the
    sliders, blog grids and anything else the theme renders with JS.
    """
    dead_src = re.compile(
        r'<script[^>]+src=["\'][^"\']*(?:wp-embed(?:\.min)?\.js|comment-reply(?:\.min)?\.js'
        r'|wp-emoji-release(?:\.min)?\.js)[^"\']*["\'][^>]*>\s*</script>', re.I)
    removed = 0
    for f in list(root.rglob("*.html")) + list(root.rglob("*.htm")):
        try:
            txt = f.read_text("utf-8", "replace")
        except OSError:
            continue
        new_txt, n = dead_src.subn("", txt)
        if n:
            removed += n
            f.write_text(new_txt, encoding="utf-8")
    log(f"stripped {removed} dead WordPress script tags (inline blocks untouched)", "ok")
    return removed


NOT_A_HOST_SUFFIX = {
    "php", "html", "htm", "js", "css", "json", "xml", "txt", "asp", "aspx",
    "cgi", "pl", "py", "rb", "jsp", "do", "png", "jpg", "jpeg", "gif", "svg",
    "webp", "ico", "woff", "woff2", "ttf", "eot", "pdf", "zip", "map",
}


def verify(root, hosts):
    html_files = list(root.rglob("*.html")) + list(root.rglob("*.htm"))
    missing, external = [], set()
    ref_re = re.compile(r'(?:src|href)=["\']([^"\']+)["\']')

    for f in html_files:
        try:
            txt = f.read_text("utf-8", "replace")
        except OSError:
            continue
        for ref in ref_re.findall(txt):
            if ref.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
                continue
            if ref.startswith(("http://", "https://", "//")):
                h = urlsplit(ref if "//" in ref[:8] else "//" + ref).netloc.lower()
                if h and h not in hosts:
                    external.add(h)
                continue
            clean = ref.split("?")[0].split("#")[0]
            base_dir = root if clean.startswith("/") else f.parent
            target = (base_dir / clean.lstrip("/")).resolve()
            if not target.exists() and not str(target).endswith("/"):
                if not (target / "index.html").exists():
                    missing.append(str(target.relative_to(root.resolve()))
                                   if str(target).startswith(str(root.resolve()))
                                   else ref)

    total_bytes = sum(p.stat().st_size for p in root.rglob("*") if p.is_file())
    # wget mangles query strings into the filename (foo.js@ver=1.2), so counting
    # by suffix alone under-reports badly. Match the real extension instead.
    assets = {}
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        m = re.search(r"\.(html?|css|js|png|jpe?g|gif|svg|webp|woff2?|ttf|ico|pdf)"
                      r"(?:[@?].*)?$", p.name, re.I)
        if m:
            assets["." + m.group(1).lower()] = assets.get("." + m.group(1).lower(), 0) + 1
    for k in (".html", ".css", ".js"):
        assets.setdefault(k, 0)

    imgs = sum(v for k, v in assets.items()
               if k in (".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"))
    log(f"{len(html_files)} html pages, {assets['.css']} css, {assets['.js']} js, "
        f"{imgs} images, {total_bytes/1e6:.1f} MB total", "ok")
    if missing:
        uniq = sorted(set(missing))
        log(f"{len(uniq)} broken local references (first few: {', '.join(uniq[:3])})", "warn")
    else:
        log("no broken local references", "ok")
    if external:
        log(f"{len(external)} still-remote hosts: {', '.join(sorted(external)[:5])}", "info")

    return {"pages": len(html_files), "assets": assets, "bytes": total_bytes,
            "broken_refs": sorted(set(missing))[:50], "broken_ref_count": len(set(missing)),
            "remote_hosts": sorted(external)}


# -------------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(
        description="Automated WordPress -> static site mirror.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="example:  ./wpscrape.py \"$URL\" --delay 1.5 --render")
    ap.add_argument("url", help="site root, e.g. https://example.com")
    ap.add_argument("--out", default="./mirror", help="output directory (default ./mirror)")
    ap.add_argument("--delay", type=float, default=1.0, help="seconds between requests")
    ap.add_argument("--rate", default="", help="wget --limit-rate value, e.g. 500k")
    ap.add_argument("--max-urls", type=int, default=5000, help="cap on discovered URLs")
    ap.add_argument("--tries", type=int, default=3, help="wget retry count")
    ap.add_argument("--render", action="store_true",
                    help="also do a headless-browser render pass (needs playwright)")
    ap.add_argument("--auto-render", action="store_true",
                    help="render only if the pilot says the site is JS-rendered")
    ap.add_argument("--wayback", action="store_true",
                    help="add historical URLs from the Wayback Machine")
    ap.add_argument("--discover-only", action="store_true",
                    help="write urls.txt and exit without downloading")
    ap.add_argument("--only-source", action="append", default=[], metavar="REGEX",
                    help="keep only URLs found via this source, e.g. --only-source posts-page")
    ap.add_argument("--exclude-source", action="append", default=[], metavar="REGEX",
                    help="drop URLs found via this source, e.g. --exclude-source posts-post")
    ap.add_argument("--sample-source", action="append", default=[], metavar="REGEX=N",
                    help="keep only N URLs from a source, e.g. --sample-source posts-post=1")
    ap.add_argument("--urls-file", metavar="FILE",
                    help="skip discovery and mirror exactly the URLs in this file")
    ap.add_argument("--exclude", action="append", default=[], metavar="REGEX",
                    help="drop URLs matching this regex (repeatable), "
                         "e.g. --exclude \"/hirek/\"")
    ap.add_argument("--include", action="append", default=[], metavar="REGEX",
                    help="keep ONLY URLs matching this regex (repeatable)")
    ap.add_argument("--sample", action="append", default=[], metavar="REGEX=N",
                    help="keep only N URLs from a section, shallowest first "
                         "(repeatable), e.g. --sample \"/hirek/=2\"")
    ap.add_argument("--auto-sample", type=int, default=0, metavar="N",
                    help="keep at most N URLs per top-level section")
    ap.add_argument("--follow-links", type=int, default=0, metavar="HOPS",
                    help="after mirroring, download internal pages that the saved "
                         "HTML links to but which are missing (nav items absent from "
                         "the sitemap, sampled-away posts). 1 hop is usually enough")
    ap.add_argument("--max-follow", type=int, default=400, metavar="N",
                    help="cap on pages fetched per hop (default 400)")
    ap.add_argument("--fetch-missing", action="store_true",
                    help="second pass: download assets referenced only from inline JS "
                         "(Divi, preloader plugins) that --page-requisites missed")
    ap.add_argument("--skip-mirror", action="store_true",
                    help="skip the wget download stage and keep the HTML already on "
                         "disk; useful with --render to redo only the render pass")
    ap.add_argument("--fixup-only", action="store_true",
                    help="skip discovery and downloading; only re-run the fixup, "
                         "relink and verify stages on the mirror already on disk")
    ap.add_argument("--strip-wp-scripts", action="store_true",
                    help="remove dead WP scripts (wp-embed, comment-reply, admin-ajax)")
    ap.add_argument("--no-pagination", action="store_true",
                    help="drop /page/2/ and ?paged=N archive pages")
    ap.add_argument("--extra-domain", action="append", default=[],
                    help="additional asset host to allow (repeatable)")
    ap.add_argument("--strict-ssl", action="store_true",
                    help="abort on TLS certificate problems instead of continuing")
    ap.add_argument("--insecure", action="store_true",
                    help="skip TLS verification from the start")
    ap.add_argument("--force", action="store_true",
                    help="continue even if bot protection is detected")
    ap.add_argument("--yes", action="store_true", help="skip the confirmation prompt")
    args = ap.parse_args()

    SSL_STATE["strict"] = args.strict_ssl
    SSL_STATE["insecure"] = args.insecure

    if not shutil.which("wget"):
        sys.exit("wget is required but not on PATH")

    base = args.url if "://" in args.url else "https://" + args.url
    base = base.rstrip("/") + "/"
    hosts = host_variants(urlsplit(base).netloc.lower())

    site_slug = re.sub(r"[^a-z0-9.-]", "_", urlsplit(base).netloc.lower())
    out_dir = Path(args.out).expanduser().resolve() / site_slug
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n\033[1mwpscrape\033[0m  target: {base}\n          output: {out_dir}")

    report = {"target": base, "output": str(out_dir),
              "started": time.strftime("%Y-%m-%d %H:%M:%S")}

    if args.fixup_only:
        site_root = out_dir
        for h in sorted(hosts):
            if (out_dir / h).is_dir():
                site_root = out_dir / h
                break
        if not any(site_root.rglob("*.html")):
            sys.exit(f"\nNo mirrored HTML found under {site_root} - nothing to fix up. "
                     f"Run without --fixup-only first.")
        log(f"fixup-only mode: working on {site_root}", "ok")

        if args.follow_links:
            phase("3c", "Following internal links")
            report["follow_links"] = follow_links(
                site_root, base, out_dir, hosts,
                set(args.extra_domain) | DEFAULT_ASSET_HOSTS, args.delay,
                args.tries, args.follow_links, args.max_follow, args.exclude)

        phase(4, "Fixups")
        report["fixups"] = fixups(site_root, hosts)
        if args.fetch_missing:
            report["fetch_missing"] = fetch_missing(
                site_root, base, out_dir, hosts,
                set(args.extra_domain) | DEFAULT_ASSET_HOSTS, args.delay, args.tries)
        report["query_refs"] = fix_query_refs(site_root, hosts)
        report["consolidate"] = consolidate_external_assets(out_dir, site_root)
        report["undo_bad_relink"] = undo_bad_relink(site_root)
        report["relink"] = relink_missing_externals(site_root, hosts)
        if args.strip_wp_scripts:
            report["stripped_scripts"] = strip_wp_scripts(site_root)

        phase(5, "Verify")
        report["verify"] = verify(site_root, hosts)
        report["finished"] = time.strftime("%Y-%m-%d %H:%M:%S")
        report["site_root"] = str(site_root)
        (out_dir / "report.json").write_text(json.dumps(report, indent=2, default=str))
        (out_dir / "run.log").write_text("\n".join(LOG_LINES) + "\n")
        print(f"\n\033[1mDone.\033[0m\n  site root : {site_root}"
              f"\n  serve it  : python3 -m http.server 8000 --directory {site_root}")
        return

    # ---- phase 0
    phase(0, "Recon")
    info, _ = recon(base)
    report["recon"] = {k: (list(v) if isinstance(v, set) else v) for k, v in info.items()}
    report["tls_verified"] = not SSL_STATE["insecure"]
    if info.get("unreachable"):
        sys.exit("\nAborting: the target did not respond. Nothing downstream can work.")
    if info["protected"] and not args.force:
        print("\nThe site sits behind a bot-protection challenge. wget will collect "
              "challenge pages instead of content.\nTry --render, or re-run with --force "
              "to proceed anyway.")
        sys.exit(2)

    # ---- phase 1
    phase(1, "URL discovery")
    if args.urls_file:
        urls = [n for n in (normalise(l) for l in Path(args.urls_file).read_text().splitlines())
                if n]
        sources = {"urls_file": len(urls)}
        log(f"loaded {len(urls)} urls from {args.urls_file}, skipping discovery", "ok")
        # Source filters work off discovery provenance, which a supplied list has
        # none of, so they would silently drop every URL. Ignore them instead.
        dropped = [f for f, v in (("--only-source", args.only_source),
                                  ("--exclude-source", args.exclude_source),
                                  ("--sample-source", args.sample_source)) if v]
        if dropped:
            log(f"ignoring {', '.join(dropped)}: the URL list has no discovery "
                f"provenance to filter on (use --include/--exclude instead)", "warn")
            args.only_source, args.exclude_source, args.sample_source = [], [], []
    else:
        urls, sources = discover(base, info, hosts, args.delay, args.max_urls, args.wayback)

    srcs = source_groups(urls)
    if len(srcs) > 1:
        log("discovery sources:")
        for name, n in srcs[:14]:
            print(f"      {name:<28} {n:>5}", flush=True)

    groups = url_groups(urls)
    if len(groups) > 1:
        log("sections found:")
        for name, n in [g for g in groups if g[1] > 1][:12]:
            bar = "#" * min(30, max(1, n * 30 // max(groups[0][1], 1)))
            print(f"      {name:<28} {n:>5}  {bar}", flush=True)

    if any([args.include, args.exclude, args.sample, args.auto_sample,
            args.no_pagination, args.only_source, args.exclude_source,
            args.sample_source]):
        urls, fstats = apply_filters(urls, args.include, args.exclude, args.sample,
                                     args.auto_sample, args.no_pagination,
                                     args.only_source, args.exclude_source,
                                     args.sample_source)
        log(f"filters: {fstats['start']} -> {fstats['end']} urls", "ok")
        sources["filtered_out"] = fstats["start"] - fstats["end"]

    # Do not clobber a list the user supplied - write the effective list elsewhere.
    urls_file = out_dir / ("urls-used.txt" if args.urls_file else "urls.txt")
    if args.urls_file and Path(args.urls_file).resolve() == urls_file.resolve():
        urls_file = out_dir / "urls-effective.txt"
    urls_file.write_text("\n".join(urls) + "\n", encoding="utf-8")
    report["discovery"] = {"sources": sources, "unique_urls": len(urls),
                           "sections": dict(groups[:20]),
                           "source_breakdown": dict(srcs[:20])}
    log(f"{len(urls)} unique URLs -> {urls_file}", "ok")

    if not urls:
        sys.exit("\nNo URLs left after filtering - nothing to do. Loosen the filters "
                 "or re-run discovery without --urls-file.")

    if args.discover_only:
        (out_dir / "report.json").write_text(json.dumps(report, indent=2))
        print(f"\ndiscover-only: {len(urls)} urls written. stopping.")
        return

    # ---- phase 2
    phase(2, "Pilot check")
    v = pilot(urls, hosts)
    report["pilot"] = {**v, "extra_hosts": sorted(v["extra_hosts"])}
    if v.get("no_samples") and not args.force:
        sys.exit("\nAborting: no sample page could be fetched. Check the URL, raise --delay, "
                 "or use --force.")
    if v["blocked"] and not args.force:
        sys.exit("\nGetting 403/429 responses. Raise --delay, or re-run with --force.")

    do_render = args.render or (args.auto_render and v["js_rendered"])

    if not args.yes:
        est = len(urls) * max(args.delay, 0.3) / 60
        what = (f"re-render {len(urls)} pages in a browser (no download)"
                if args.skip_mirror else
                f"fetch {len(urls)} pages plus assets (~{est:.0f}+ min "
                f"at {args.delay}s delay)")
        ans = input(f"\nAbout to {what}. Continue? [y/N] ")
        if ans.strip().lower() not in ("y", "yes"):
            sys.exit("aborted")

    # ---- phase 3
    extra = (set(args.extra_domain) | v["extra_hosts"] | DEFAULT_ASSET_HOSTS) \
        - KEEP_REMOTE_HOSTS
    if args.skip_mirror:
        phase(3, "Mirror (skipped)")
        log("--skip-mirror: keeping the HTML already on disk", "ok")
        report["mirror"] = {"skipped": True}
    else:
        phase(3, "Mirror")
        report["mirror"] = mirror_wget(urls_file, out_dir, hosts, extra,
                                       args.delay, args.rate, args.tries)
    if do_render:
        phase("3b", "Headless render pass")
        render_root = out_dir
        for h in sorted(hosts):
            if (out_dir / h).is_dir():
                render_root = out_dir / h
                break
        report["render"] = mirror_render(urls, out_dir, args.delay, render_root)

    # ---- phase 4
    site_root = out_dir
    for h in sorted(hosts):
        if (out_dir / h).is_dir():
            site_root = out_dir / h
            break
    if args.follow_links:
        phase("3c", "Following internal links")
        report["follow_links"] = follow_links(
            site_root, base, out_dir, hosts, extra, args.delay, args.tries,
            args.follow_links, args.max_follow, args.exclude)

    phase(4, "Fixups")
    site_root = out_dir
    for h in sorted(hosts):
        if (out_dir / h).is_dir():
            site_root = out_dir / h
            break
    report["fixups"] = fixups(site_root, hosts)
    if args.fetch_missing:
        report["fetch_missing"] = fetch_missing(site_root, base, out_dir, hosts,
                                                extra, args.delay, args.tries)
    report["query_refs"] = fix_query_refs(site_root, hosts)
    report["consolidate"] = consolidate_external_assets(out_dir, site_root)
    report["undo_bad_relink"] = undo_bad_relink(site_root)
    report["relink"] = relink_missing_externals(site_root, hosts)
    if args.strip_wp_scripts:
        report["stripped_scripts"] = strip_wp_scripts(site_root)

    # ---- phase 5
    phase(5, "Verify")
    report["verify"] = verify(site_root, hosts)
    report["finished"] = time.strftime("%Y-%m-%d %H:%M:%S")
    report["site_root"] = str(site_root)

    (out_dir / "report.json").write_text(json.dumps(report, indent=2, default=str))
    (out_dir / "run.log").write_text("\n".join(LOG_LINES) + "\n")

    print(f"\n\033[1mDone.\033[0m")
    print(f"  site root : {site_root}")
    print(f"  report    : {out_dir/'report.json'}")
    print(f"  serve it  : python3 -m http.server 8000 --directory {site_root}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit("\ninterrupted")
