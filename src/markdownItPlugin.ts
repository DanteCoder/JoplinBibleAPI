import { BibleLanguage } from './interfaces/bibleIndex';
import { getOsisBible } from './utils/getOsisBible';
import { getOsisBibles } from './utils/getOsisBibles';
import { getPluginConfig } from './utils/getPluginConfig';
import bibleIndexFull from './bibleIndex';
import ErrorManager from './components/ErrorManager';
import Main from './components/Main';
import parser from './parser';

let pluginConfig = getPluginConfig();
let bibleIndex: BibleLanguage = bibleIndexFull[pluginConfig.bookNamesLang];
let osisBibleResult = getOsisBible(pluginConfig.biblePath);
let defaultOsisBible = osisBibleResult.osisBible;
let osisBibles = getOsisBibles(pluginConfig.biblesPath);
let availableVersions = osisBibles.map((bible) => bible.$.osisIDWork);
let bcv = importBcvParser(pluginConfig.citeLang);
const bibleInfo = bcv.translation_info();

export default function (context) {
  return {
    plugin: function (markdownIt, _options) {
      const defaultRender =
        markdownIt.renderer.rules.fence ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options, env, self);
        };

      markdownIt.renderer.rules.fence = function (tokens, idx, options, env, self) {
        const token = tokens[idx];

        // The token after the "```"
        if (token.info !== 'bible') return defaultRender(tokens, idx, options, env, self);

        // Update the runtime variables with the new plugin config
        if (localStorage.getItem('bibleQuoteSettingsUpdated') === 'true') {
          localStorage.setItem('bibleQuoteSettingsUpdated', 'false');
          pluginConfig = getPluginConfig();
          bibleIndex = bibleIndexFull[pluginConfig.bookNamesLang];
          osisBibleResult = getOsisBible(pluginConfig.biblePath);
          defaultOsisBible = osisBibleResult.osisBible;
          osisBibles = getOsisBibles(pluginConfig.biblesPath);
          availableVersions = osisBibles.map((bible) => bible.$.osisIDWork);
          bcv = importBcvParser(pluginConfig.citeLang);
        }

        // Handle osis bible import errors
        if (osisBibleResult.errorMessage) return ErrorManager(osisBibleResult.errorMessage);

        // Parse the block of bible code
        const parseResult = parser(token.content, bcv, availableVersions);

        // Handle parsing errors
        if (parseResult.type === 'error') return ErrorManager(parseResult.errorMessage);

        // Pending Help component
        if (parseResult.type === 'help') return '';

        // Create the html to render
        const html = Main({
          bibleIndex,
          bibleInfo,
          defaultOsisBible,
          osisBibles,
          parsedEntities: parseResult.entities,
          pluginConfig,
        });

        return html;
      };
    },
  };
}

/**
 * Imports the corresponding bcv parser to match the configured language.
 * @param citationLanguage
 * @returns bcv parser.
 */
function importBcvParser(citationLanguage: string): any {
  const bcvParser: any = require(`bible-passage-reference-parser/js/${citationLanguage}_bcv_parser`).bcv_parser;
  const bcv = new bcvParser();
  return bcv;
}
