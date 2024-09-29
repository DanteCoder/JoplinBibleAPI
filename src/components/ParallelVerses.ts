import { cssObj2String } from '../utils/cssObj2String';
import { getVerseText } from '../utils/getVerseText';
import Verse from './Verse';

interface Props {
  bookId: string;
  chapter: ParsedChapter;
  versions: string[];
  osisBibles: OsisBible[];
  style: any;
}

/**
 * Creates the html for parallel verses
 * @param props
 * @returns html string
 */
export default function ParallelVerses(props: Props) {
  const { bookId, chapter, osisBibles, style, versions } = props;
  const html = document.createElement('div');
  html.setAttribute(
    'style',
    cssObj2String({
      display: 'grid',
      rowGap: `${style.fontSize ? parseFloat(style.fontSize) / 2 : 8}px`,
      columnGap: `${style.fontSize ? parseFloat(style.fontSize) : 16}px`,
      gridTemplateColumns: '1fr '.repeat(versions.length),
    })
  );

  for (const verse of chapter.verses) {
    for (const version of versions) {
      const verseText = getVerseText(osisBibles.find((bible) => bible.$.osisIDWork === version)!, {
        b: bookId,
        c: chapter.id,
        v: verse,
      });

      html.innerHTML += Verse({ displayNumber: true, number: verse, text: verseText, style });
    }
  }

  return html.outerHTML;
}
