import { bibleIndexFull } from '../languages';
import { defaultConfig } from '../settings';
import { EmittedEvents, listen } from '../utils/communicator';
import { tokenParser } from './tokenParser';

/**
 * Utility class to update the markdown plugin from the source plugin.
 */
export class Parser {
  /**
   * Whether the parser has been initialized.
   */
  initialized: boolean;
  /**
   * An error coming from the main plugin.
   */
  mainPluginError?: string;
  /**
   * The bcv-parser instance
   */
  bcvParser: any;
  /**
   * The osis Bibles
   */
  osisBibles: any[];
  /**
   * The available Bible versions
   */
  availableVersions: string[];
  /**
   * The Bible index
   */
  bibleIndex: BibleLanguage;
  /**
   * The plugin config
   */
  pluginConfig: PluginConfig;

  constructor() {
    this.initialized = false;
    this.pluginConfig = defaultConfig;
    this.bcvParser = this.#initBcvParser(defaultConfig.language);
    this.osisBibles = [];
    this.availableVersions = [];
    this.bibleIndex = bibleIndexFull.en;

    this.#init();
  }

  /**
   * Parses a block's content and returns the parsed entities.
   */
  parse(tokenContent: string) {
    return tokenParser(tokenContent, this.bcvParser, this.availableVersions);
  }

  /**
   * Attaches the event listeners.
   */
  #init() {
    listen<any[]>(EmittedEvents.BibleFiles, this.#handleOsisBiblesChange.bind(this));
    listen<PluginConfig>(EmittedEvents.PluginConfig, this.#handleConfigChange.bind(this));
    listen<string>(EmittedEvents.Error, this.#handleMainPluginError.bind(this));
  }

  /**
   * Handles a change in the osis bibles.
   * @param osisBibles The new osis bibles
   */
  #handleOsisBiblesChange = (osisBibles: any[]) => {
    this.osisBibles = osisBibles;
    this.availableVersions = osisBibles.map((bible) => bible.$.osisIDWork);
  };

  /**
   * Handles a change in the plugin config.
   * @param config The new plugin config
   */
  #handleConfigChange = (config: PluginConfig) => {
    const { language } = config;

    this.pluginConfig = config;
    this.bcvParser = this.#initBcvParser(language);

    this.initialized = true;
    this.mainPluginError = undefined;
  };

  /**
   * Handles an error coming from the main plugin.
   * @param errorMessage The error message
   */
  #handleMainPluginError = (errorMessage: string) => {
    if (this.mainPluginError) return;
    this.mainPluginError = errorMessage;

    this.initialized = true;
  };

  /**
   * Initializes the BCV parser.
   * @param language The language of the parser to load
   */
  #initBcvParser = (language: keyof BibleIndex) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { bcv_parser: bcvParser } = require(`bible-passage-reference-parser/js/${language}_bcv_parser`);
    const bcv = new bcvParser();

    return bcv;
  };
}
