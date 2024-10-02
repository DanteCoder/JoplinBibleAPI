import { cssObj2String } from '../utils/cssObj2String';
import type { ParsedEntity } from '../utils/tokenParser';
import CitationsBlock from './CitationsBlock';
import ParallelBlock from './ParallelBlock';

interface Props {
  bibleIndex: BibleLanguage;
  bibleInfo: any;
  defaultOsisBible: OsisBible;
  osisBibles: OsisBible[];
  parsedEntities: ParsedEntity[];
  pluginConfig: PluginConfig;
}

/**
 * Creates the html for the render
 * @param props
 * @returns html string
 */
export default function Main(props: Props) {
  const { bibleIndex, bibleInfo, parsedEntities, defaultOsisBible, osisBibles, pluginConfig } = props;
  const html = document.createElement('div');
  html.setAttribute('style', `border:1px solid #545454;`);

  for (const entity of parsedEntities) {
    if (entity.options?.parallel) {
      html.innerHTML += ParallelBlock({
        bibleIndex,
        bibleInfo,
        osisBibles,
        parsedEntity: entity,
        pluginConfig,
      });
    }

    if (!entity.options?.parallel) {
      html.innerHTML += CitationsBlock({
        bibleIndex,
        bibleInfo,
        defaultOsisBible,
        entity,
        osisBibles,
        pluginConfig,
      });
    }

    // Add a line separator between blocks
    if (entity === parsedEntities[parsedEntities.length - 1]) continue;
    html.innerHTML += `<hr style="${cssObj2String({
      border: 'none',
      borderTop: '3px double grey',
      marginBottom: '0px',
      marginLeft: '15px',
      marginRight: '15px',
      marginTop: '0px',
    })}">`.repeat(2);
  }

  return html.outerHTML;
}
