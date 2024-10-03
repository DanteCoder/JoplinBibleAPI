import { bibleIndexFull } from '../languages';
import { cssObj2String } from '../utils/cssObj2String';
import { parseQuote } from '../utils/parseQuote';
import type { ParsedEntity } from '../utils/tokenParser';
import BookName from './BookTitle';
import ChapterTitle from './ChapterTitle';
import FullCitation from './FullCitation';
import ParallelVerses from './ParallelVerses';

interface Props {
  bibleIndex: BibleLanguage;
  bibleInfo: any;
  parsedEntity: ParsedEntity;
  osisBibles: ElementProxy[];
  pluginConfig: PluginConfig;
}

/**
 * Creates the html for parallel bible versions
 * @param props
 * @returns html string
 */
export default function ParallelBlock(props: Props) {
  const { bibleIndex, bibleInfo, osisBibles, parsedEntity, pluginConfig } = props;
  const html = document.createElement('div');

  html.setAttribute(
    'style',
    cssObj2String({
      padding: '30px',
    })
  );

  for (const osisObject of parsedEntity.osisObjects) {
    const parsedQuote = parseQuote(osisObject, bibleIndex, bibleInfo);

    const citationsDiv = document.createElement('div');
    citationsDiv.setAttribute(
      'style',
      cssObj2String({
        display: 'grid',
        columnGap: `${pluginConfig.verseFontSize}px`,
        gridTemplateColumns: '1fr '.repeat(parsedEntity.versions.length),
      })
    );
    for (const version of parsedEntity.versions) {
      citationsDiv.innerHTML += FullCitation({
        citation: parsedQuote.cite,
        displayOsisIDWork: true,
        osisIDWork: version,
        style: {
          fontSize: `${pluginConfig.verseFontSize}px`,
        },
      });
    }
    html.appendChild(citationsDiv);

    for (const book of parsedQuote.books) {
      if (parsedQuote.books.length > 1) {
        html.innerHTML += BookName({
          name: book.name,
          style: {
            fontSize: `${pluginConfig.verseFontSize * 1.6}px`,
            margin: '0px',
            textAlign: pluginConfig.bookAlignment,
          },
        });
      }

      for (const chapter of book.chapters) {
        if (parsedQuote.books.length > 1 || book.chapters.length > 1) {
          html.innerHTML += ChapterTitle({
            number: chapter.id,
            style: {
              fontSize: `${pluginConfig.verseFontSize * 1.1}px`,
              padding: `${pluginConfig.chapterPadding}px`,
              textAlign: pluginConfig.chapterAlignment,
            },
            text: bibleIndexFull[pluginConfig.language].chapter,
          });
        }

        html.innerHTML += ParallelVerses({
          bookId: book.id,
          chapter: chapter,
          osisBibles,
          versions: parsedEntity.versions,
          style: {
            fontSize: `${pluginConfig.verseFontSize}px`,
            textAlign: pluginConfig.verseAlignment,
          },
        });
      }
    }

    // Add a line separator between citations
    if (osisObject !== parsedEntity.osisObjects[parsedEntity.osisObjects.length - 1]) {
      html.innerHTML += `<hr style="border: none; border-top: 1px solid grey; margin: ${pluginConfig.verseFontSize}px">`;
    }
  }

  return html.outerHTML;
}
