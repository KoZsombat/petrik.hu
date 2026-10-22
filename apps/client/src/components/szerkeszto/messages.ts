/** The server's error codes (server/routes/pages.ts) in the editor's words. */
export const SAVE_ERRORS: Record<string, string> = {
  missing_title: 'Az oldal címe kötelező.',
  invalid_document:
    'A tartalom nem menthető - valamelyik link, kép vagy szín formátuma hibás (a hibás mezőknél piros figyelmeztetés látszik).',
  invalid_overrides:
    'A módosítások nem menthetők - valamelyik link, kép vagy szín formátuma hibás (a hibás mezőknél piros figyelmeztetés látszik).',
  invalid_menu: 'A menü nem menthető - minden menüpontnak kell név, és a linkek formátuma legyen helyes.',
  invalid_library: 'A Dokumentumtár nem menthető - minden kategóriának és dokumentumnak kell név, és a fájl linkje legyen helyes.',
  unsupported_file: 'Ez a fájltípus nem tölthető fel (pdf, Word, Excel, PowerPoint, OpenDocument, txt, csv, zip lehet).',
  file_too_large: 'A fájl túl nagy - legfeljebb 9 MB lehet.',
  forbidden: 'Ehhez nincs jogosultságod.',
  not_found: 'Az oldal már nem létezik.',
}
