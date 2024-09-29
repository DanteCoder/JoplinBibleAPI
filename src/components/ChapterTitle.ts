import { cssObj2String } from '../utils/cssObj2String';

interface Props {
  number: number;
  style: any;
  text: string;
}

/**
 * Creates the html for the Chapter title
 * @param props
 * @returns html string
 */
export default function ChapterTitle(props: Props) {
  const { number, style, text } = props;
  const html = document.createElement('h3');

  html.setAttribute('style', cssObj2String({ ...style, minWidth: 'max-content' }));
  html.innerHTML = `${text} ${number}`;

  return html.outerHTML;
}
