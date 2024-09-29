import { cssObj2String } from '../utils/cssObj2String';

interface Props {
  bibleIndex: BibleLanguage;
  bibleInfo: any;
  bookId?: string;
}

export default function BibleIndex(props: Props) {
  const { bibleIndex, bibleInfo, bookId } = props;
  const osisBooksIds: Array<string> = Object.keys(bibleInfo.order);
  const osisBooksOrder: Array<number> = Object.values(bibleInfo.order);
  const html = document.createElement('div');

  html.setAttribute(
    'style',
    cssObj2String({
      padding: '30px',
      border: '1px solid blue',
      textAlign: 'left',
      display: 'grid',
      gridTemplateColumns: !bookId ? '1fr 0.6fr 0.4fr' : '1fr 1fr',
    })
  );

  if (bookId) {
    html.innerHTML += `<p>${bibleIndex.books[bibleInfo.order[bookId] - 1]}</p>`;
    html.innerHTML += '<p></p>';

    html.innerHTML += `<p>${bibleIndex.chapter}</p>`;
    html.innerHTML += `<p>${bibleIndex.verses}</p>`;

    (bibleInfo.chapters[bookId] as string[]).forEach((verses, i) => {
      let p = document.createElement('p');
      p.setAttribute('style', cssObj2String({ margin: '0px' }));
      p.innerHTML = `${i + 1}`;
      html.appendChild(p);

      p = document.createElement('p');
      p.setAttribute('style', cssObj2String({ margin: '0px' }));
      p.innerHTML = verses;
      html.appendChild(p);
    });
  } else {
    html.innerHTML += `<p>${bibleIndex.book}</p>`;
    html.innerHTML += `<p>${bibleIndex.chapters}</p>`;
    html.innerHTML += `<p>OSIS ID</p>`;

    bibleIndex.books.forEach((book, i) => {
      let p = document.createElement('p');
      p.setAttribute('style', cssObj2String({ margin: '0px' }));
      p.innerHTML = `${i + 1}. ${book}`;
      html.appendChild(p);

      p = document.createElement('p');
      p.setAttribute('style', cssObj2String({ margin: '0px' }));
      const osisId = osisBooksIds[osisBooksOrder[i] - 1];
      p.innerHTML = bibleInfo.chapters[osisId].length;
      html.appendChild(p);

      p = document.createElement('p');
      p.setAttribute('style', cssObj2String({ margin: '0px' }));
      p.innerHTML = osisId;
      html.appendChild(p);

      if (i === 38) {
        html.innerHTML += '<p></p>'.repeat(3);
      }
    });
  }

  return html.outerHTML;
}
