/**
 * The allowed values for the alignment.
 */
type TextAlignment = 'left' | 'center' | 'right' | 'justify';

/**
 * The plugin configuration.
 */
interface PluginConfig {
  /**
   * The language to display for book names and to parse citations.
   */
  language: keyof BibleIndex;
  /**
   * The note where the bibles are stored as resources.
   */
  biblesNote: string;
  /**
   * The default Bible version to use.
   */
  defaultVersion: string;
  /**
   * The font size for the verses.
   */
  verseFontSize: number;
  /**
   * The text alignment for the verses.
   */
  verseAlignment: TextAlignment;
  /**
   * The text alignment for the book names.
   */
  bookAlignment: TextAlignment;
  /**
   * The alignment of the chapters.
   */
  chapterAlignment: TextAlignment;
  /**
   * The padding of the chapters.
   */
  chapterPadding: number;
}

/**
 * The available languages.
 */
interface BibleIndex {
  en: BibleLanguage;
  es: BibleLanguage;
  fr: BibleLanguage;
  zh: BibleLanguage;
}

/**
 * An object with the text for a particular language.
 */
interface BibleLanguage {
  /**
   * The "book" word in a language.
   */
  book: string;
  /**
   * The list of books in the Bible in a particular language.
   * The books are ordered from 1 to 66.
   */
  books: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string
  ];
  /**
   * The "chapter" word in a language.
   */
  chapter: string;
  /**
   * The "chapters" word in a language.
   */
  chapters: string;
  /**
   * The "verses" word in a language.
   */
  verses: string;
}

interface ParsedQuote {
  books: ParsedBook[];
  cite: string;
}

interface ParsedBook {
  id: string;
  num: number;
  name: string;
  chapters: ParsedChapter[];
}

interface ParsedChapter {
  id: number;
  verses: number[];
}

/**
 * The message types from the markdown plugin.
 */
type MdPostMessageType = 'parseBlock';

/**
 * The message sent to the main plugin from the markdown plugin.
 */
interface MdPostMessage {
  type: MdPostMessageType;
  content: string;
}

/**
 * Utility type to get the resolved type of a promise
 */
type PromiseResolvedType<T> = T extends Promise<infer R> ? R : never;

/**
 * Utility type to get the resolved type of a function
 */
type ReturnedPromiseResolvedType<T extends (...args: any) => any> = PromiseResolvedType<ReturnType<T>>;
