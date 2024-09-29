import type { PluginSimple } from 'markdown-it';
import BibleIndex from '../components/BibleIndex';
import ErrorManager from '../components/ErrorManager';
import Help from '../components/Help';
import Main from '../components/Main';
import { Parser } from './parser';

const pluginParser = new Parser();

/**
 * The markdown-it plugin.
 */
const plugin: PluginSimple = (markdownIt) => {
  const defaultRender =
    markdownIt.renderer.rules.fence ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  markdownIt.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];

    // The token after the "```"
    if (token.info !== 'bible') {
      return defaultRender(tokens, idx, options, env, self);
    }

    if (!pluginParser.initialized) {
      return ErrorManager('Plugin is initializing. Try again in a few seconds.');
    }

    if (pluginParser.mainPluginError) {
      return ErrorManager(pluginParser.mainPluginError);
    }

    if (!pluginParser.osisBibles.length) {
      return ErrorManager('No Bibles available');
    }

    const parseResult = pluginParser.parse(token.content);

    if (parseResult.type === 'error') {
      return ErrorManager(parseResult.errorMessage ?? 'Something went wrong');
    }

    if (parseResult.type === 'help') {
      return Help({
        language: pluginParser.pluginConfig.language,
      });
    }

    // Handle "index" command
    if (parseResult.type === 'index') {
      return BibleIndex({
        bibleIndex: pluginParser.bibleIndex,
        bibleInfo: pluginParser.bcvParser.translation_info(),
        bookId: parseResult.bookId ?? undefined,
      });
    }

    // Create the html to render
    const html = Main({
      bibleIndex: pluginParser.bibleIndex,
      bibleInfo: pluginParser.bcvParser.translation_info(),
      defaultOsisBible: pluginParser.osisBibles[0],
      osisBibles: pluginParser.osisBibles,
      parsedEntities: parseResult.entities ?? [],
      pluginConfig: pluginParser.pluginConfig,
    });

    return html;
  };
};

export default () => {
  return {
    plugin,
  };
};
