/**
 * Gets the bcv parsed entities object andcreates a normalized citation text.
 * @param osisObject https://github.com/openbibleinfo/Bible-Passage-Reference-Parser#parsed_entities
 * @param bibleIndex
 * @param bibleInfo https://github.com/openbibleinfo/Bible-Passage-Reference-Parser#translation_infotranslation
 * @returns The normalized citation
 */
export function osis2Cite(osisObject: OsisObject, bibleIndex: BibleLanguage, bibleInfo: any) {
  let citation = '';

  /**
   * entity types:
   * bcv  =>  Single verse
   * bc  =>  Single chapter
   * cv  =>  Can be preceded by (bcv || bc)
   * integer  =>  Can be preceded by (bcv || bc || cv)
   * range  =>  Can be preceded by (bcv || bc || cv || null)
   */

  let lastType = null;
  let lastBook = null;
  let lastChap = null;

  for (const entity of osisObject.entities) {
    if (entity.type === 'bcv') {
      if (entity.start.b !== lastBook) {
        const bookName = bibleIndex.books[bibleInfo.books.indexOf(entity.start.b)];
        citation += ' ' + bookName + ' ' + entity.start.c + ':' + entity.start.v;
      } else {
        if (entity.start.c === lastChap) {
          citation += ',' + entity.start.v;
        } else {
          citation += ';' + entity.start.c + ':' + entity.start.v;
        }
      }

      lastType = 'v';
      lastBook = entity.start.b;
      lastChap = entity.start.c;
    } else if (entity.type === 'bc') {
      if (entity.start.b !== lastBook) {
        const bookName = bibleIndex.books[bibleInfo.books.indexOf(entity.start.b)];
        citation += ' ' + bookName + ' ' + entity.start.c;
      } else {
        citation += ';' + entity.start.c;
      }

      lastType = 'c';
      lastBook = entity.start.b;
      lastChap = entity.start.c;
    } else if (entity.type === 'cv') {
      if (entity.start.c !== lastChap) {
        citation += ';' + entity.start.c + ':' + entity.start.v;
      } else {
        citation += ',' + entity.start.v;
      }

      lastType = 'v';
      lastChap = entity.start.c;
    } else if (entity.type === 'integer') {
      if (lastType === 'v') {
        citation += ',' + entity.start.v;
      } else if (lastType === 'c') {
        citation += ';' + entity.start.c;
      }
    } else if (entity.type === 'range') {
      //Get the type of range
      let rangeType = null;
      if (entity.start.b !== entity.end.b) {
        rangeType = 'book';
      } else {
        if (entity.start.c !== entity.end.c) {
          rangeType = 'chap';
        } else {
          if (entity.start.v !== entity.end.v) {
            rangeType = 'verse';
          }
        }
      }

      const startEntityType = entity.start.type;
      const endEntityType = entity.end.type;

      if (rangeType === 'verse') {
        if (startEntityType === 'bcv') {
          if (entity.start.b !== lastBook) {
            const bookName = bibleIndex.books[bibleInfo.books.indexOf(entity.start.b)];
            citation += ' ' + bookName + ' ' + entity.start.c + ':' + entity.start.v;
          } else {
            citation += ',' + entity.start.v;
          }
          lastType = 'v';
        } else if (startEntityType === 'bc') {
          if (entity.start.b !== lastBook) {
            const bookName = bibleIndex.books[bibleInfo.books.indexOf(entity.start.b)];
            citation += ' ' + bookName + ' ' + entity.start.c + ':' + entity.start.v;
          } else {
            citation += ',' + entity.start.v;
          }
          lastType = 'v';
        } else if (startEntityType === 'cv') {
          if (entity.start.c !== lastChap) {
            citation += ';' + entity.start.c + ':' + entity.start.v;
          } else {
            citation += ',' + entity.start.v;
          }
          lastType = 'v';
        } else if (startEntityType === 'integer') {
          if (lastType === 'v') {
            citation += ',' + entity.start.v;
          } else if (lastType === 'c') {
            citation += ';' + entity.start.c;
          }
        } else {
          citation += 'not handled';
        }

        citation += '-' + entity.end.v;
        lastType = 'v';
      } else if (rangeType === 'chap') {
        if (startEntityType === 'bcv') {
          if (entity.start.b !== lastBook) {
            const bookName = bibleIndex.books[bibleInfo.books.indexOf(entity.start.b)];
            citation += ' ' + bookName + ' ' + entity.start.c + ':' + entity.start.v;
          } else {
            citation += ';' + entity.start.c + ':' + entity.start.v;
          }
          lastType = 'v';
        } else if (startEntityType === 'bc') {
          if (entity.start.b !== lastBook) {
            const bookName = bibleIndex.books[bibleInfo.books.indexOf(entity.start.b)];
            citation += ' ' + bookName + ' ' + entity.start.c;
          } else {
            citation += ';' + entity.start.c;
          }
          lastType = 'c';
        } else if (startEntityType === 'cv') {
          if (entity.start.c !== lastChap) {
            citation += ';' + entity.start.c + ':' + entity.start.v;
          } else {
            citation += ',' + entity.start.v;
          }
          lastType = 'v';
        } else if (startEntityType === 'integer') {
          if (lastType === 'v') {
            citation += ',' + entity.start.v;
          } else if (lastType === 'c') {
            citation += ';' + entity.start.c;
          }
        } else {
          citation += 'not handled';
        }

        citation += '-';

        if (endEntityType === 'bcv') {
          citation += entity.end.c + ':' + entity.end.v;
        } else if (endEntityType === 'bc') {
          citation += entity.end.c;
        } else if (endEntityType === 'cv') {
          citation += entity.end.c + ':' + entity.end.v;
        } else if (endEntityType === 'integer') {
          if (lastType === 'v') {
            citation += entity.end.v;
          } else if (lastType === 'c') {
            citation += entity.end.c;
          }
        } else {
          citation += 'not handled';
        }
      } else if (rangeType === 'book') {
        const startBookName = bibleIndex.books[bibleInfo.books.indexOf(entity.start.b)];
        const endBookName = bibleIndex.books[bibleInfo.books.indexOf(entity.end.b)];
        citation += ' ' + startBookName + ' ';

        if (startEntityType === 'bcv') {
          citation += entity.start.c + ':' + entity.start.v;
        } else if (startEntityType === 'bc') {
          citation += entity.start.c;
        } else if (startEntityType === 'cv') {
          citation += entity.start.c + ':' + entity.start.v;
        } else if (startEntityType === 'integer') {
          if (lastType === 'v') {
            citation += entity.start.c + ':' + entity.start.v;
          } else if (lastType === 'c') {
            citation += entity.start.c;
          }
        }

        citation += ' - ' + endBookName + ' ';

        if (endEntityType === 'bcv') {
          citation += entity.end.c + ':' + entity.end.v;
          lastType = 'v';
        } else if (endEntityType === 'bc') {
          citation += entity.end.c;
          lastType = 'c';
        } else {
          citation += 'not handled';
        }

        lastBook = null;
        lastChap = null;
      } else {
        citation += 'not a range';
      }
    }
  }

  return citation;
}
