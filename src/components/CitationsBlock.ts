import { bibleIndexFull } from '../languages';
import type { ParsedEntity } from '../markdownPlugin/tokenParser';
import { cssObj2String } from '../utils/cssObj2String';
import { getVerseText } from '../utils/getVerseText';
import { parseQuote } from '../utils/parseQuote';
import Book from './Book';
import Chapter from './Chapter';
import Citation from './Citation';
import Verse from './Verse';

interface Props {
  bibleIndex: BibleLanguage;
  bibleInfo: any;
  entity: ParsedEntity;
  defaultOsisBible: OsisBible;
  osisBibles: OsisBible[];
  pluginConfig: PluginConfig;
}

/**
 * Creates the html for a list of citations
 * @param props
 * @returns html string
 */
export default function CitationsBlock(props: Props) {
  const { bibleIndex, bibleInfo, defaultOsisBible, entity, osisBibles, pluginConfig } = props;
  const html = document.createElement('div');

  html.setAttribute(
    'style',
    cssObj2String({
      padding: '30px',
    })
  );

  const parsedQuotes: Array<ParsedQuote> = [];
  for (const osisObject of entity.osisObjects) {
    parsedQuotes.push(parseQuote(osisObject, bibleIndex, bibleInfo));
  }

  for (const version of entity.versions) {
    let osisBible: OsisBible;
    if (version === 'default') {
      osisBible = defaultOsisBible;
    } else {
      osisBible = osisBibles.find((bible) => bible.$.osisIDWork === version)!;
    }

    for (const fullQuote of parsedQuotes) {
      const booksHtml = [];
      for (const book of fullQuote.books) {
        const chaptersHTML = [];
        for (const chapter of book.chapters) {
          const versesHTML = [];
          for (const verse of chapter.verses) {
            const verseText = getVerseText(osisBible, { b: book.id, c: chapter.id, v: verse });
            versesHTML.push(
              Verse({
                text: verseText,
                number: verse,
                displayNumber: chapter.verses.length > 1 || book.chapters.length > 1 || fullQuote.books.length > 1,
                style: {
                  fontSize: `${pluginConfig.verseFontSize}px`,
                  textAlign: pluginConfig.verseAlignment,
                },
              })
            );
          }

          chaptersHTML.push(
            Chapter({
              verses: versesHTML,
              text: bibleIndexFull[pluginConfig.language].chapter,
              number: chapter.id,
              displayChapter: book.chapters.length > 1 || fullQuote.books.length > 1,
              style: {
                fontSize: `${pluginConfig.verseFontSize * 1.1}px`,
                padding: `${pluginConfig.chapterPadding}px`,
                textAlign: pluginConfig.chapterAlignment,
                textIndent: `${pluginConfig.verseFontSize * 2}px`,
              },
            })
          );
        }

        booksHtml.push(
          Book({
            chapters: chaptersHTML,
            name: book.name,
            displayName: fullQuote.books.length > 1,
            style: {
              fontSize: `${pluginConfig.verseFontSize * 1.6}px`,
              margin: '0px',
              textAlign: pluginConfig.bookAlignment,
            },
          })
        );
      }

      html.innerHTML += Citation({
        books: booksHtml,
        citation: fullQuote.cite,
        osisIDWork: osisBible.$.osisIDWork,
        displayFullCitation: true,
        displayOsisIDWork: true,
        style: {
          fontSize: `${pluginConfig.verseFontSize}px`,
        },
      });

      // Add a line separator between citations
      if (fullQuote !== parsedQuotes[parsedQuotes.length - 1]) {
        html.innerHTML += `<hr style="border: none; border-top: 1px solid grey; margin: ${pluginConfig.verseFontSize}px">`;
      }
    }

    // Add a line separator between versions
    if (version === entity.versions[entity.versions.length - 1]) continue;
    html.innerHTML += `<hr style="${cssObj2String({
      border: 'none',
      borderTop: '3px double grey',
      marginTop: `${pluginConfig.verseFontSize}px`,
      marginBottom: `${pluginConfig.verseFontSize}px`,
    })}">`;
  }

  return html.outerHTML;
}
