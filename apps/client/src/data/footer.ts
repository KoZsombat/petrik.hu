/**
 * Footer widget content extracted from the mirror: the WordPress category tree
 * and the school's contact block.
 *
 * Data only — the Footer component renders it as JSX.
 */
import type { MenuItem } from './site.ts'

export const calendarTitle = "Hírek napi bontásban"

export const categoriesTitle = "Kategóriák"

/** Blog categories, up to three levels deep, as the footer widget lists them. */
export const categoryTree: MenuItem[] = [
  {
    label: "Egyéb kategória",
    to: "/kategoria/egyeb/",
    children: [
      { label: "Állásajánlatok", to: "/kategoria/egyeb/allasajanlatok/" },
      { label: "Díjak és elismerések", to: "/kategoria/egyeb/dijak-es-elismeresek/" },
      { label: "In Memoriam", to: "/kategoria/egyeb/in-memoriam/" },
      { label: "Iskolai-egészségügy", to: "/kategoria/egyeb/iskolai-egeszsegugy/" },
      { label: "Örökös ökoiskola", to: "/kategoria/egyeb/orokos-okoiskola/" },
      {
        label: "Projekt",
        to: "/kategoria/egyeb/projekt/",
        children: [
          { label: "#dthpetrik2020", to: "/kategoria/egyeb/projekt/dthpetrik2020/" },
          { label: "#dthpetrik2021", to: "/kategoria/egyeb/projekt/dthpetrik2021/" },
          { label: "#dthpetrik2022", to: "/kategoria/egyeb/projekt/dthpetrik2022/" },
          { label: "#dthpetrik2023", to: "/kategoria/egyeb/projekt/dthpetrik2023/" },
          { label: "#dthpetrik2024", to: "/kategoria/egyeb/projekt/dthpetrik2024/" },
          { label: "#dthpetrik2025", to: "/kategoria/egyeb/projekt/dthpetrik2025/" },
          { label: "#dthpetrik2026", to: "/kategoria/egyeb/projekt/dthpetrik2026/" },
          { label: "#petrikcodeweek2024", to: "/kategoria/egyeb/projekt/petrikcodeweek2024/" },
          { label: "#petrikcodeweek2025", to: "/kategoria/egyeb/projekt/petrikcodeweek2025/" },
          { label: "#petrikcodeweek2026", to: "/kategoria/egyeb/projekt/petrikcodeweek2026/" },
          { label: "Erasmus+", to: "/kategoria/egyeb/projekt/erasmus/" },
          { label: "eTwinning", to: "/kategoria/egyeb/projekt/etwinning/" },
        ],
      },
      { label: "Versenyeredmény", to: "/kategoria/egyeb/versenyeredmeny/" },
    ],
  },
  { label: "English", to: "/kategoria/english/" },
  { label: "Étkezések", to: "/kategoria/etkezesek/" },
  {
    label: "Hírek",
    to: "/kategoria/hirek/",
    children: [
      { label: "Főoldali kiemelt hirek", to: "/kategoria/hirek/fooldali-kiemelt-hirek/" },
      { label: "Kiemelt hírek", to: "/kategoria/hirek/kiemelt-hirek/" },
    ],
  },
  {
    label: "Oktatás",
    to: "/kategoria/oktatas/",
    children: [
      { label: "Esti munkarend", to: "/kategoria/oktatas/esti-munkarend/" },
      {
        label: "Nappali képzés",
        to: "/kategoria/oktatas/nappali-kepzes/",
        children: [
          { label: "Közoktatás", to: "/kategoria/oktatas/nappali-kepzes/kozoktatas/" },
          { label: "Szakképzés", to: "/kategoria/oktatas/nappali-kepzes/szakkepzes/" },
        ],
      },
      { label: "Nyári gyakorlat", to: "/kategoria/oktatas/nyari-gyakorlat/" },
      { label: "Nyolcadikosoknak", to: "/kategoria/oktatas/nyolcadikosoknak/" },
    ],
  },
  {
    label: "Vizsga",
    to: "/kategoria/vizsga/",
    children: [
      { label: "Ágazati alapvizsga", to: "/kategoria/vizsga/agazati-alapvizsga/" },
      { label: "Érettségi", to: "/kategoria/vizsga/erettsegi/" },
      { label: "Mellék-szakképesítés", to: "/kategoria/vizsga/mellek-szakkepesites/" },
      { label: "Szakmai vizsga", to: "/kategoria/vizsga/szakmai-vizsga/" },
    ],
  },
]

export const contactTitle = "Elérhetőségek"

/** One entry per paragraph; the inner strings are separated by <br />. */
export const contactParagraphs: string[][] = [
  ["Budapesti Műszaki SZC", "Petrik Lajos Két Tanítási Nyelvű Technikum"],
  ["OM azonosító: 203 058", "Technikai kód: 520413"],
  ["Levelezési cím: 1146 Budapest, Thököly út 48-54."],
  ["E-mail: info@petrik.hu", "Telefon: +36 70 502 1724"],
]
