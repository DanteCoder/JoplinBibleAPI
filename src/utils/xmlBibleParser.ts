import { parseString as parseXmlString } from 'xml2js';

/**
 * Parses an xml bible to a JS object.
 * @param bibleFile The xml bible
 */
export function xmlBible2Js(bibleFile: Buffer) {
  let parseResult: any = null;

  parseXmlString(bibleFile, (error, result) => {
    if (error) {
      console.error(error);
      return;
    }

    parseResult = result;
  });

  if (!parseResult) return null;

  return parseResult.osis?.osisText?.[0];
}
