import joplin from '../api';
import { type SettingItem, SettingItemType } from '../api/types';

/**
 * The default plugin configuration.
 */
export const defaultConfig: PluginConfig = {
  language: 'en',
  biblesNote: '',
  defaultVersion: '',
  verseFontSize: 16,
  verseAlignment: 'justify',
  bookAlignment: 'center',
  chapterAlignment: 'left',
  chapterPadding: 10,
};

/**
 * The available language options.
 */
const languageOptions: Record<keyof BibleIndex, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'Français',
  zh: 'Chinese',
};

/**
 * The available text alignment options.
 */
const alignmentOptions: Record<TextAlignment, string> = {
  center: 'Center',
  left: 'Left',
  right: 'Right',
  justify: 'Justify',
};

const settings: Record<keyof PluginConfig, SettingItem> = {
  language: {
    value: defaultConfig.language,
    type: SettingItemType.String,
    isEnum: true,
    section: 'bibleQuoteSection',
    public: true,
    label: 'Language',
    description: 'The language to display for book names and to parse citations.',
    options: languageOptions,
  },
  biblesNote: {
    value: defaultConfig.biblesNote,
    type: SettingItemType.String,
    section: 'bibleQuoteSection',
    public: true,
    label: 'Bibles Note',
    description: 'The name of the note where the Bibles are stored.',
  },
  defaultVersion: {
    value: defaultConfig.defaultVersion,
    type: SettingItemType.String,
    section: 'bibleQuoteSection',
    public: true,
    label: 'Default Bible version',
    description: 'The default Bible version to use. If not set, the first found version will be used.',
  },
  verseFontSize: {
    value: defaultConfig.verseFontSize,
    minimum: 10,
    maximum: 30,
    type: SettingItemType.Int,
    section: 'bibleQuoteSection',
    public: true,
    label: 'Verse font size',
  },
  verseAlignment: {
    value: defaultConfig.verseAlignment,
    type: SettingItemType.String,
    isEnum: true,
    section: 'bibleQuoteSection',
    public: true,
    label: 'Verse alignment',
    options: alignmentOptions,
  },
  bookAlignment: {
    value: defaultConfig.bookAlignment,
    type: SettingItemType.String,
    isEnum: true,
    section: 'bibleQuoteSection',
    public: true,
    label: 'Bible book name alignment',
    options: alignmentOptions,
  },
  chapterAlignment: {
    value: defaultConfig.chapterAlignment,
    type: SettingItemType.String,
    isEnum: true,
    section: 'bibleQuoteSection',
    public: true,
    label: 'Chapter number alignment',
    options: alignmentOptions,
  },
  chapterPadding: {
    value: defaultConfig.chapterPadding,
    minimum: 0,
    maximum: 100,
    type: SettingItemType.Int,
    section: 'bibleQuoteSection',
    public: true,
    label: 'Chapter side padding',
    description: 'Chapter side padding in pixels.',
  },
};

/**
 * Registers the plugin settings.
 */
export async function register() {
  await joplin.settings.registerSection('bibleQuoteSection', {
    iconName: 'fas fa-book',
    label: 'Bible Quote',
  });

  await joplin.settings.registerSettings(settings);
}
