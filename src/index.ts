import joplin from '../api';
import { ContentScriptType } from '../api/types';
import * as Settings from './settings';
import { EmittedEvents, send } from './utils/communicator';
import { CustomError } from './utils/customError';
import { xmlBible2Js } from './utils/xmlBibleParser';

/**
 * The id of the Bibles note.
 */
let biblesNoteId: string = '';

/**
 * A list of Bible files.
 */
export type BibleFiles = ReturnedPromiseResolvedType<typeof getBibleFiles>;

/**
 * Initializes the plugin.
 */
export const init = async () => {
  console.info('Initializing the Bible Quote plugin...');

  await Settings.register();

  joplin.settings.onChange(sendDataToMarkdownPlugin);
  joplin.workspace.onNoteChange(onBiblesNoteChange);

  await joplin.contentScripts.register(ContentScriptType.MarkdownItPlugin, 'bible-quote', './markdownPlugin/plugin.js');
  await sendDataToMarkdownPlugin();

  console.info('Bible Quote plugin initialized.');
};

/**
 * Called when a note is changed.
 */
const onBiblesNoteChange: Parameters<typeof joplin.workspace.onNoteChange>[0] = async (e) => {
  if (e.id !== biblesNoteId) return;
  await sendBibleFiles();
};

/**
 * Sends the plugin settings and Bible files to the markdown plugin.
 */
const sendDataToMarkdownPlugin = async () => {
  console.info('Sending data to the markdown plugin...');

  try {
    biblesNoteId = await getBiblesNoteId();
    await sendBibleFiles();
    await sendPluginSettings();
  } catch (error) {
    if (error instanceof CustomError) {
      send(EmittedEvents.Error, error.message);
    } else {
      console.error(error);
      send(EmittedEvents.Error, 'Something went wrong.');
    }
  }

  console.info('Data sent to the markdown plugin.');
};

/**
 * Sends the Bible files to the markdown plugin.
 * @param files The parsed Bible objects
 * @throws Error
 */
const sendBibleFiles = async () => {
  const bibleFiles = await getBibleFiles(biblesNoteId);
  const bibleFilesJs = await openBibleFiles(bibleFiles);
  send(EmittedEvents.BibleFiles, bibleFilesJs);
};

/**
 * Sends the plugin settings to the markdown plugin.
 */
const sendPluginSettings = async () => {
  const pluginSettings: Record<string, string> = {};
  await Promise.all(
    Object.keys(Settings.defaultConfig).map(async (key) => {
      const value = await joplin.settings.value(key);
      pluginSettings[key] = value;
    })
  );
  send(EmittedEvents.PluginConfig, pluginSettings);
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

  return [defaultVersion, ...osisBibles.filter((bible) => bible.$.osisIDWork === defaultVersionSetting)];
};

joplin.plugins.register({
  onStart: async function () {
    init();
  },
});
