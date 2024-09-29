import ChapterTitle from './ChapterTitle';

interface Props {
  verses: string[];
  number: number;
  text: string;
  displayChapter: boolean;
  style: any;
}

/**
 * Creates the html for a chapter
 * @param props
 * @returns html string
 */
export default function Chapter(props: Props) {
  const { verses, text, number, displayChapter, style } = props;
  const html = document.createElement('div');

  if (displayChapter) {
    html.innerHTML += ChapterTitle({ number, style, text });
  }

  const versesDiv = document.createElement('div');
  versesDiv.setAttribute('style', `display: flex; flex-direction: column; gap: 8px;`);

  for (const verse of verses) {
    versesDiv.innerHTML += verse;
  }
  html.appendChild(versesDiv);

  return html.outerHTML;
}
