// Libraries
import path = require('path');

// Utils
import bibleIndexFull from './bibleIndex';
import { createBookHtml, createChapterHtml, createCitationHtml, createVerseHtml } from './htmlCreator';
import { getVerseText } from './utils/getVerseText';
import { parseQuote } from './utils/parseQuote';
import { getOsisBible } from './utils/getOsisBible';

// Interfaces
import { BibleLanguage } from './interfaces/bibleIndex';
import { PluginConfig } from './interfaces/config';

let pluginConfig: PluginConfig = getPluginConfig();
let bibleIndex: BibleLanguage = bibleIndexFull[pluginConfig.bookNamesLanguage];
let importResult = getOsisBible(pluginConfig.biblePath);
let osisBible = importResult.osisBible;
let bcv = importBcvParser(pluginConfig.citationLanguage);
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
        if (localStorage.getItem('pluginSettingsUpdated') === 'true') {
          localStorage.setItem('pluginSettingsUpdated', 'false');
          pluginConfig = getPluginConfig();
          bibleIndex = bibleIndexFull[pluginConfig.bookNamesLanguage];
          importResult = getOsisBible(pluginConfig.biblePath);
          osisBible = importResult.osisBible;
          bcv = importBcvParser(pluginConfig.citationLanguage);
        }

        // Invalid osis Bible import handle
        if (importResult.error) {
          return (
            '<div style="padding:35px; border: 1px solid #545454;">' +
            '<p style="text-align: center;">There is no selected OSIS xml bible or the path is invalid.<p>' +
            `<p style="text-align: center;">Error code: ${importResult.error}<p>` +
            '</div>'
          );
        }

        const html = document.createElement('div');
        // Extract the citations from the block of text
        const citations = token.content.replace(/\n/g, ' ').match(/\(.*?\)/g);

        if (citations) {
          html.setAttribute('style', `border:1px solid #545454;`);

          for (const citationIndex in citations) {
            const citation = citations[citationIndex];
            const fullQuote = parseQuote(citation, bcv, bibleIndex, bibleInfo);

            const booksHtml = [];
            for (const book of fullQuote.books) {
              const chaptersHTML = [];
              for (const chapter of book.chapters) {
                const versesHTML = [];
                for (let verse of chapter.verses) {
                  const verseText = getVerseText(osisBible, { book: book.num, chapter: chapter.id, verse });
                  versesHTML.push(
                    createVerseHtml(verseText, verse, {
                      verseFontSize: pluginConfig.verseFontSize,
                      displayNumber:
                        pluginConfig.displayFormat === 'full' ||
                        chapter.verses.length > 1 ||
                        book.chapters.length > 1 ||
                        fullQuote.books.length > 1,
                    })
                  );
                }

                chaptersHTML.push(
                  createChapterHtml(versesHTML, {
                    chapterAlignment: pluginConfig.chapterAlignment,
                    chapterNumber: chapter.id,
                    chapterPadding: pluginConfig.chapterPadding,
                    chapterText: pluginConfig.chapterTitleText,
                    displayChapter:
                      pluginConfig.displayFormat === 'full' ||
                      (pluginConfig.displayFormat === 'cite' && book.chapters.length > 1),
                  })
                );
              }

              booksHtml.push(
                createBookHtml(chaptersHTML, {
                  bookAlignment: pluginConfig.bookAlignment,
                  bookName: book.name,
                  displayBookName:
                    pluginConfig.displayFormat === 'full' ||
                    (pluginConfig.displayFormat === 'cite' && fullQuote.books.length > 1),
                })
              );
            }

            html.innerHTML += createCitationHtml(booksHtml, {
              citation: fullQuote.cite,
              diplayFullCitation: pluginConfig.displayFormat === 'cite',
            });

            // Add a line separator after the citation if theres is more than one
            // and don't add a separator to the last one
            if (parseInt(citationIndex) !== citations.length - 1) {
              const divisorHr = document.createElement('hr');
              divisorHr.setAttribute('width', `90%`);
              divisorHr.setAttribute('size', `1`);
              html.appendChild(divisorHr);
            }
          }
        }

        return html.outerHTML;
      };
    },
  };
}

/**
 * Gets the plugin configuration from localStorage
 * @returns pluginConfig object
 */
function getPluginConfig(): PluginConfig {
  const pluginConfig: any = {
    citationLanguage: localStorage.getItem('citeLang'),
    bookNamesLanguage: localStorage.getItem('bookNamesLang'),
    biblePath: path.normalize(localStorage.getItem('biblePath')),
    bookAlignment: localStorage.getItem('bookAlignment'),
    chapterAlignment: localStorage.getItem('chapterAlignment'),
    chapterPadding: localStorage.getItem('chapterPadding'),
    verseFontSize: localStorage.getItem('verseFontSize'),
    verseAlignment: localStorage.getItem('verseAlignment'),
    displayFormat: localStorage.getItem('displayFormat'),
  };
  pluginConfig.chapterTitleText = bibleIndexFull[pluginConfig.bookNamesLanguage].chapterTitle;

  for (const key in pluginConfig) {
    if (pluginConfig[key] === '') pluginConfig[key] = null;
  }

  return pluginConfig;
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
