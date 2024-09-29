import { cssObj2String } from '../utils/cssObj2String';

interface Props {
  text: string;
  number: number;
  displayNumber: boolean;
  style: any;
}

/**
 * Creates the html for a verse
 * @param props
 * @returns html string
 */
export default function Verse(props: Props) {
  const { text, number, displayNumber, style } = props;
  const html = document.createElement('div');

  html.setAttribute('style', cssObj2String(style));
  if (displayNumber) html.innerHTML += `${number}. `;
  html.innerHTML += text;

  return html.outerHTML;
}
