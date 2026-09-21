/**
 * Site chrome extracted from the mirror: the two menus, the footer widgets and
 * the contact details. This is data, not markup — the header and footer
 * components render it as JSX.
 *
 * `to` is an in-app route. `href` is an external link, opened in a new tab.
 * An item with neither is a dropdown parent that is not itself clickable.
 */

export type MenuItem = {
  label: string
  to?: string
  href?: string
  children?: MenuItem[]
}

/** Utility links in the green bar above the header. */
export const secondaryMenu: MenuItem[] = [
  { label: 'Helyettesítés', href: 'https://filc.petrik.hu/subs' },
  {
    label: 'Eseménynaptár',
    href: 'https://outlook.office365.com/owa/calendar/d318bbea4a914be2abe826c0b376cc50@petrik.hu/240a9f1bbed44e0fb49ae8369939f7773872042457095598299/calendar.html',
  },
  { label: 'Órarend', href: 'https://filc.petrik.hu/' },
  { label: 'Dokumentumtár', to: '/dokumentumtar/' },
  { label: 'Adatvédelem', to: '/adatvedelem/' },
  { label: 'Kréta', href: 'http://bmszc-petrik.e-kreta.hu/' },
  { label: 'Levelezés', href: 'https://outlook.office.com/owa/' },
]

/** The main navigation. Five of the seven entries open a dropdown. */
export const primaryMenu: MenuItem[] = [
  { label: 'Kezdőlap', to: '/' },
  { label: 'Hírek', to: '/kategoria/hirek/' },
  { label: 'Bemutatkozás', to: '/bemutatkozas/' },
  {
    label: 'Oktatás',
    children: [
      { label: 'Nyolcadikosoknak', to: '/nyolcadikos/' },
      { label: 'Közoktatás', to: '/kozoktatas/' },
      { label: 'Szakképzés', to: '/technikusi-kepzesek/' },
      { label: 'Esti munkarend', to: '/kategoria/oktatas/esti-munkarend/' },
      { label: 'Közösségi szolgálat', to: '/kozossegi-szolgalat/' },
      { label: 'Nyári gyakorlatok', to: '/nyari-gyakorlatok/' },
    ],
  },
  {
    label: 'Vizsga',
    children: [
      { label: 'Érettségi', to: '/erettsegi-vizsga/' },
      { label: 'Ágazati alapvizsga', to: '/kategoria/vizsga/agazati-alapvizsga/' },
      { label: 'Mellék-szakképesítés', to: '/kategoria/vizsga/mellek-szakkepesites/' },
      { label: 'Szakmai vizsga', to: '/szakmai-vizsga/' },
      { label: 'LanguageCert vizsga', to: '/languagecert-vizsgak/' },
    ],
  },
  {
    label: 'Egyéb',
    children: [
      { label: 'Állásajánlatok', to: '/allas/' },
      { label: 'Étkezés', to: '/ebed/' },
      { label: 'Iskola-Egészségügy', to: '/egeszsegugy/' },
      { label: 'In memoriam', to: '/in-memoriam/' },
      { label: 'Kollégiumi lehetőségek', to: '/kollegiumi-lehetosegek/' },
      { label: 'Örökös Ökoiskola', to: '/orokos-okoiskola/' },
      { label: 'Projektek', to: '/projekt/' },
      { label: 'Versenyeredmény', to: '/kategoria/egyeb/versenyeredmeny/' },
    ],
  },
  {
    label: 'Kapcsolat',
    children: [
      { label: 'Elérhetőség', to: '/elerhetoseg/' },
      { label: 'Tanári kar', to: '/tanari-kar/' },
    ],
  },
  {
    label: 'EN',
    children: [{ label: 'About Us', to: '/about-us/' }],
  },
]

/** Contact details shown in the top bar. */
export const contact = {
  phone: '+36 70 502 1724',
  email: 'info@petrik.hu',
}

/** Social profiles, shown in the top bar and the footer. */
export const socialLinks = [
  { network: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/BMSZCPetrik/' },
  { network: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/petrikinsta/' },
] as const

export const footerInfo = 'Minden jog fenntartva. Copyright © 2023.'
