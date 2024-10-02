import joplin from '../api';
import { ContentScriptType } from '../api/types';
import BibleIndex from './components/BibleIndex';
import ErrorManager from './components/ErrorManager';
import Help from './components/Help';
import Main from './components/Main';
import { CONTENT_SCRIPT_ID } from './constants';
import { bibleIndexFull } from './languages';
import * as Settings from './settings';
import { CustomError } from './utils/customError';
import { tokenParser } from './utils/tokenParser';
import { xmlBible2Js } from './utils/xmlBibleParser';

/**
 * The id of the Bibles note.
 */
let biblesNoteId: string = '';

/**
 * The list of opened Osis Bibles.
 */
let osisBibles: any[] = [];

/**
 * The parser for Bible quotes.
 */
let bcvParser: any;

/**
 * An error message to send to the markdown plugin.
 */
let errorMessage: string = '';

/**
 * A list of Bible files.
 */
type BibleFiles = ReturnedPromiseResolvedType<typeof getBibleFiles>;

/**
 * Initializes the plugin.
 */
export const init = async () => {
  console.info('Initializing the Bible Quote plugin...');

  await Settings.register();
  await initDependencies();

  joplin.settings.onChange(initDependencies);
  joplin.workspace.onNoteChange(onBiblesNoteChange);

  await joplin.contentScripts.register(
    ContentScriptType.MarkdownItPlugin,
    CONTENT_SCRIPT_ID,
    './markdownPlugin/plugin.js'
  );

  joplin.contentScripts.onMessage(CONTENT_SCRIPT_ID, onParseBlockMessage);

  console.info('Bible Quote plugin initialized.');
};

/**
 * Parses a block from the markdown plugin.
 * @param message The message from the markdown plugin
 */
const onParseBlockMessage = async (message: MdPostMessage) => {
  if (message.type !== 'parseBlock') return;

  if (errorMessage) {
    return ErrorManager(errorMessage);
  }

  const language = (await joplin.settings.value('language')) as keyof BibleIndex;
  const bibleIndex = bibleIndexFull[language];

  const parseResult = tokenParser(
    message.content,
    bcvParser,
    osisBibles.map((bible) => bible.$.osisIDWork)
  );

  if (parseResult.type === 'error') {
    return ErrorManager(parseResult.errorMessage ?? 'Something went wrong');
  }

  if (parseResult.type === 'help') {
    return Help({ language });
  }

  // Handle "index" command
  if (parseResult.type === 'index') {
    return BibleIndex({
      bibleIndex,
      bibleInfo: bcvParser.translation_info(),
      bookId: parseResult.bookId,
    });
  }

  // Create the html to render
  return Main({
    bibleIndex,
    bibleInfo: bcvParser.translation_info(),
    defaultOsisBible: osisBibles[0],
    osisBibles,
    parsedEntities: parseResult.entities ?? [],
    pluginConfig: await getPluginConfig(),
  });
};

/**
 * Initializes the dependencies.
 */
const initDependencies = async () => {
  await initBibles();
  await initBcvParser();
};

/**
 * Initializes the Bible files.
 */
const initBibles = async () => {
  console.info('Initializing Bible files...');

  try {
    biblesNoteId = await getBiblesNoteId();
    await updateBibleFiles();

    errorMessage = '';
  } catch (error) {
    if (error instanceof CustomError) {
      errorMessage = error.message;
    } else {
      console.error(error);
      errorMessage = 'Something went wrong.';
    }
  }

  console.info('Bible files initialized.');
};

/**
 * Initializes the BCV parser.
 * @param language The language of the parser to load
 */
const initBcvParser = async () => {
  const language = (await joplin.settings.value('language')) as keyof BibleIndex;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { bcv_parser: libBcvParser } = require(`bible-passage-reference-parser/js/${language}_bcv_parser`);
  const bcv = new libBcvParser();

  bcvParser = bcv;
};

/**
 * Called when a note is changed.
 */
const onBiblesNoteChange: Parameters<typeof joplin.workspace.onNoteChange>[0] = async (e) => {
  if (e.id !== biblesNoteId) return;
  await updateBibleFiles();
};

/**
 * Sends the Bible files to the markdown plugin.
 * @param files The parsed Bible objects
 * @throws Error
 */
const updateBibleFiles = async () => {
  const bibleFiles = await getBibleFiles(biblesNoteId);
  const bibleFilesJs = await openBibleFiles(bibleFiles);
  osisBibles = bibleFilesJs;
};

/**
 * Sends the Bible files to the markdown plugin.
 * @throws Error
 */
const getBiblesNoteId = async () => {
  const resourceNoteName = await joplin.settings.value('biblesNote');

  if (!resourceNoteName) {
    throw new CustomError('No Bibles note configured.');
  }

  const result = await joplin.data.get(['search'], {
    query: resourceNoteName,
    type: 'note',
  });

  if (!result.items?.length) {
    throw new CustomError(`Bibles note with title "${resourceNoteName}" not found.`);
  }

  const [biblesNote] = result.items;
  return biblesNote.id as string;
};

/**
 * Gets the xml Bible files from a note.
 * @throws Error
 */
const getBibleFiles = async (biblesNoteId: string) => {
  if (!biblesNoteId) {
    throw new CustomError('No Bibles note configured.');
  }

  const result = await joplin.data.get(['notes', biblesNoteId, 'resources']);

  if (!result.items?.length) {
    throw new CustomError('No files found in the configured Bibles note.');
  }

  const bibleFiles = (
    await Promise.all(
      (result.items as { id: string; title: string }[]).map(async (item) => {
        const result = (await joplin.data.get(['resources', item.id, 'file'])) as {
          body: Uint8Array;
          contentType: string;
        };

        return {
          ...result,
          id: item.id,
          title: item.title,
        };
      })
    )
  ).filter((item) => item.contentType === 'application/xml');

  if (!bibleFiles.length) {
    throw new CustomError('No xml files found in the configured Bibles note.');
  }

  return bibleFiles;
};

/**
 * Parses the Bible files xmls to js objects.
 */
const openBibleFiles = async (bibleFiles: BibleFiles) => {
  const osisBibles = bibleFiles
    .map((bible) => {
      const buffer = Buffer.from(bible.body);
      return xmlBible2Js(buffer);
    })
    .filter((b) => b != null);

  if (!osisBibles.length) {
    throw new CustomError(
      'Could not parse any Bible files from the configured Bibles note.' +
        ' Please make sure you are using valid OSIS Bible files.'
    );
  }

  const defaultVersionSetting = (await joplin.settings.value('defaultVersion')) as string;
  if (!defaultVersionSetting) {
    console.info(`Default Bible version not set. Using ${osisBibles[0].$.osisIDWork}.`);
    return osisBibles;
  }

  const defaultVersion = osisBibles.find((bible) => bible.$.osisIDWork === defaultVersionSetting);
  if (!defaultVersion) {
    console.info(`Default Bible version ${defaultVersionSetting} not found. Using ${osisBibles[0].$.osisIDWork}.`);
    return osisBibles;
  }

  return [defaultVersion, ...osisBibles.filter((bible) => bible.$.osisIDWork !== defaultVersionSetting)];
};

/**
 * Gets the plugin configuration.
 */
const getPluginConfig = async () => {
  const pluginSettings: any = {};
  await Promise.all(
    Object.keys(Settings.defaultConfig).map(async (key) => {
      const value = await joplin.settings.value(key);
      pluginSettings[key] = value;
    })
  );

  return pluginSettings as PluginConfig;
};

joplin.plugins.register({
  onStart: async function () {
    init();
  },
});
