import { cssObj2String } from '../utils/cssObj2String';

interface Props {
  style: any;
  citation: string;
  osisIDWork: string;
  displayOsisIDWork: boolean;
}

/**
 * Creates the html for a full citation
 * @param props
 * @returns html string
 */
export default function FullCitation(props: Props) {
  const { citation, displayOsisIDWork, osisIDWork, style } = props;
  const html = document.createElement('h3');

  html.setAttribute('style', cssObj2String(style));
  html.innerHTML = `<b>${citation}<b>`;

  if (displayOsisIDWork) html.innerHTML += `<b> (${osisIDWork})<b>`;

  return html.outerHTML;
}
