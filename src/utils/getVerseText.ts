/**
 * Extracts a verse from an OSIS Bible
 * @param osisBible
 * @param bcv
 * @returns string verse
 */
export function getVerseText(osisBible: OsisBible, bcv: BCV): string {
  const book = osisBible.div.find((book) => book.$.osisID === bcv.b)!;

  const chapter = book.chapter[bcv.c - 1];
  const verse = chapter.verse[bcv.v - 1];
  let verseText = verse._;

  verseText = verseText.trim();
  verseText = verseText.replace(/\n /g, '<br>----');
  verseText = verseText.replace(/\s+/g, ' ');
  verseText = verseText.replace(/----/g, '\t');

  return verseText;
}
