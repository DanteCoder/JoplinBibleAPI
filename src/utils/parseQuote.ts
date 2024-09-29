import { osis2Cite } from './osis2Cite';

/**
 * Parses a bible quote like "Genesis 1:1" into a JS object.
 * @param osisObject
 * @param bibleIndex
 * @param bibleInfo https://github.com/openbibleinfo/Bible-Passage-Reference-Parser#translation_infotranslation
 * @returns The parsed quote organized in books, chapters and verses
 */
export function parseQuote(osisObject: OsisObject, bibleIndex: BibleLanguage, bibleInfo: any): ParsedQuote {
  const parsedQuote: ParsedQuote = { books: [], cite: '' };

  let startBcv: BCV | null = null;
  let endBcv: BCV | null = null;

  // Normalized citation
  parsedQuote.cite = osis2Cite(osisObject, bibleIndex, bibleInfo);

  for (const entity of osisObject.entities) {
    startBcv = entity.start;
    endBcv = entity.end;

    const startBook = bibleInfo.books.indexOf(startBcv.b) + 1;
    const endBook = bibleInfo.books.indexOf(endBcv.b) + 1;

    for (let book = startBook; book <= endBook; book++) {
      const bookId = bibleInfo.books[book - 1];
      // The number of books in the chapter
      const bookChapterNumbers = bibleInfo.chapters[bookId].length;

      if (startBook === endBook) {
        //If there is only one book in the citation
        for (let chapter = startBcv.c; chapter <= endBcv.c; chapter++) {
          // The number of verses in the chapter
          const chaperVerseNumber = bibleInfo.chapters[bookId][chapter - 1];

          if (startBcv.c === endBcv.c) {
            //If there is only one chapter in the citation
            for (let verse = startBcv.v; verse <= endBcv.v; verse++) {
              push2ParsedQuote(bookId + '.' + chapter + '.' + verse);
            }
          } else if (chapter === startBcv.c) {
            //If chapter is the first chapter of the citation
            for (let verse = startBcv.v; verse <= chaperVerseNumber; verse++) {
              push2ParsedQuote(bookId + '.' + chapter + '.' + verse);
            }
          } else if (chapter === endBcv.c) {
            //If chapter is the last chapter of the citation
            for (let verse = 1; verse <= endBcv.v; verse++) {
              push2ParsedQuote(bookId + '.' + chapter + '.' + verse);
            }
          } else {
            //If chapter is any chapter in between the first and last chapters of the citation
            for (let verse = 1; verse <= chaperVerseNumber; verse++) {
              push2ParsedQuote(bookId + '.' + chapter + '.' + verse);
            }
          }
        }
      } else if (book === startBook) {
        // If book is the first book of the citation
        for (let chapter = startBcv.c; chapter <= bookChapterNumbers; chapter++) {
          const c_v_num = bibleInfo.chapters[bookId][chapter - 1];

          if (chapter === startBcv.c) {
            //If chapter is the first chapter of the citation
            for (let verse = startBcv.v; verse <= c_v_num; verse++) {
              push2ParsedQuote(bookId + '.' + chapter + '.' + verse);
            }
          } else {
            //If chapter is any chapter in between the first and last chapters, or is the last chapter of the citation
            for (let verse = 1; verse <= c_v_num; verse++) {
              push2ParsedQuote(bookId + '.' + chapter + '.' + verse);
            }
          }
        }
      } else if (book === endBook) {
        // If book is the last book of the citation
        for (let chapter = 1; chapter <= endBcv.c; chapter++) {
          // The number of verses in the chapter
          const chapterVerseNumber = bibleInfo.chapters[bookId][chapter - 1];

          if (chapter === endBcv.c) {
            //If chapter is the last chapter of the citation
            for (let verse = 1; verse <= endBcv.v; verse++) {
              push2ParsedQuote(bookId + '.' + chapter + '.' + verse);
            }
          } else {
            //If chapter is any chapter in between the first and last chapters, or is the first chapter of the citation
            for (let verse = 1; verse <= chapterVerseNumber; verse++) {
              push2ParsedQuote(bookId + '.' + chapter + '.' + verse);
            }
          }
        }
      } else {
        // If book is any book in between the first and last books of the citation
        for (let chapter = 1; chapter <= bookChapterNumbers; chapter++) {
          // The number of verses in the chapter
          const chapterVerseNumber = bibleInfo.chapters[bookId][chapter - 1];

          for (let verse = 1; verse <= chapterVerseNumber; verse++) {
            push2ParsedQuote(bookId + '.' + chapter + '.' + verse);
          }
        }
      }
    }
  }

  /**
   * Extracts the book, chapter and verse from an osis citation
   * and pushes the book, chapter or verse to the parsedQuote
   * only if the elements are not already pushed.
   * @param singleOsisVerse the osis citation as "book.chapter.verse"
   */
  function push2ParsedQuote(singleOsisVerse: string): void {
    const split = singleOsisVerse.split('.');
    const osisParts: BCV = {
      b: split[0],
      c: parseInt(split[1]),
      v: parseInt(split[2]),
    };
    let lastBookIndex: number | null = null;
    let lastChapterIndex: number | null = null;

    const bookNumber = bibleInfo.order[osisParts.b];
    const bookName = bibleIndex.books[bookNumber - 1];

    // Push the book if there are no books in parsedQuote
    if (parsedQuote.books.length === 0) {
      parsedQuote.books.push({
        id: osisParts.b,
        num: bookNumber,
        name: bookName,
        chapters: [],
      });
    }
    // Push the book to parsedQuote only if it's different from the last pushed book pushed
    else {
      lastBookIndex = parsedQuote.books.length - 1;
      if (parsedQuote.books[lastBookIndex].id !== osisParts.b) {
        parsedQuote.books.push({
          id: osisParts.b,
          num: bookNumber,
          name: bookName,
          chapters: [],
        });
      }
    }
    lastBookIndex = parsedQuote.books.length - 1;

    // Push the chapter to the last book pushed if the book is empty
    if (parsedQuote.books[lastBookIndex].chapters.length === 0) {
      parsedQuote.books[lastBookIndex].chapters.push({
        id: osisParts.c,
        verses: [],
      });
    }
    // Push the chapter to the last book pushed only if it's different from the last pushed chapter
    else {
      lastChapterIndex = parsedQuote.books[lastBookIndex].chapters.length - 1;
      if (parsedQuote.books[lastBookIndex].chapters[lastChapterIndex].id !== osisParts.c) {
        parsedQuote.books[lastBookIndex].chapters.push({
          id: osisParts.c,
          verses: [],
        });
      }
    }
    lastChapterIndex = parsedQuote.books[lastBookIndex].chapters.length - 1;

    // Push the verse to the last chapter pushed
    parsedQuote.books[lastBookIndex].chapters[lastChapterIndex].verses.push(osisParts.v);
  }

  return parsedQuote;
}
