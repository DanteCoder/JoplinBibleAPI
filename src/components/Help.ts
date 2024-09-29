import { helpLanguages } from '../languages';
import { cssObj2String } from '../utils/cssObj2String';

interface Props {
  language: keyof BibleIndex;
}

/**
 * Creates the html for help
 * @param error
 * @returns html string
 */
export default function Help(props: Props) {
  const { language } = props;
  const html = document.createElement('div');
  html.setAttribute(
    'style',
    cssObj2String({
      padding: '30px',
      border: '1px solid green',
      textAlign: 'left',
    })
  );

  const helpLanguage =
    language in helpLanguages ? helpLanguages[language as keyof typeof helpLanguages] : helpLanguages.en;

  html.innerHTML = helpLanguage.replace(/\n/g, '<br>');
  return html.outerHTML;
}
