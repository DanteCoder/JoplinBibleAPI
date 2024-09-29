interface ParseResult {
  type: 'entities' | 'error' | 'help' | 'index';
  errorMessage?: string;
  entities?: ParsedEntity[];
  bookId?: string;
}

export interface ParsedEntity {
  versions: string[];
  osisObjects: any[];
  options?: EntityOptions;
}

interface EntityOptions {
  parallel?: boolean;
}

const versionKeyword = /^version\s"([^"]+)"$/;
const versionsKeyword = /^versions\s("[^"]+"(?:,\s?"[^"]+")*)(?: (par))?$/;
const helpKeyword = /^help$/;
const indexKeyword = /^index(?: ([^\s]+))?$/;
const emptyLine = /^\s*$/;
const citationRegExp = /^\(([^()]+)\)$/;

/**
 * Parses a block of bible code into groups of ParsedEntities
 * grouped by bible version. On each "version" or "versions"
 * keyword a new group is created
 * @param tokenContent
 * @param bcvParser
 * @param availableVersions
 * @returns An object containing the parsed entities
 */
export const tokenParser = (tokenContent: string, bcvParser: any, availableVersions: string[]): ParseResult => {
  const lines = tokenContent.split('\n');
  let parseResult: ParseResult = {
    type: 'entities',
    entities: [
      {
        osisObjects: [],
        versions: ['default'],
      },
    ],
  };

  const bibleInfo = bcvParser.translation_info();

  bcvParser.set_options({
    osis_compaction_strategy: 'bcv',
    consecutive_combination_strategy: 'separate',
  });

  let errorMessage = null;
  linesLoop: for (const line of lines) {
    let match: any;

    // If the line is a citation push it to parsedEntities with the current versions
    match = line.match(citationRegExp);
    if (match) {
      // Check if the citation is valid
      const osisId = bcvParser.parse(match[1]).osis();
      if (osisId === '') {
        errorMessage = `Invalid citation: "${match[1]}"`;
        break;
      }

      const bcvParsedObject: OsisObject = bcvParser.parse(match[1]).parsed_entities()[0];
      parseResult.entities?.[parseResult.entities.length - 1].osisObjects.push(bcvParsedObject);
      continue;
    }

    // If the keyword is "version"
    match = line.match(versionKeyword);
    if (match) {
      // Extract the version
      const versionMatchResult = extractVersion(match[1], availableVersions);
      if (versionMatchResult.type === 'error') {
        errorMessage = versionMatchResult.errorMessage;
        break;
      }

      // Push a new entity
      const pushResult = pushNewEntity(parseResult.entities ?? [], [versionMatchResult.version ?? 'default']);
      if (pushResult.type === 'error') {
        errorMessage = pushResult.errorMessage;
        break;
      }

      continue;
    }

    // If the keyword id "versions"
    match = line.match(versionsKeyword);
    if (match) {
      // Extract the versions
      const extractedVersions: string[] = [];
      const _versions: Array<string> = match[1].split(',');
      for (const _version of _versions) {
        const versionMatchResult = extractVersion(_version.replace(/(?:^\s")+|"+/g, ''), availableVersions);
        if (versionMatchResult.type === 'error') {
          errorMessage = versionMatchResult.errorMessage;
          break linesLoop;
        }

        // Push the version to extractedVersions if it's not already in
        if (extractedVersions.includes(versionMatchResult.version ?? 'default')) continue;
        extractedVersions.push(versionMatchResult.version ?? 'default');
      }

      // Check for the keyword "par"
      const options: EntityOptions = {
        parallel: match[2] ? true : false,
      };

      const pushResult = pushNewEntity(parseResult.entities ?? [], extractedVersions, options);
      if (pushResult.type === 'error') {
        errorMessage = pushResult.errorMessage;
        break;
      }

      continue;
    }

    // If the keyword is "help" send help
    match = line.match(helpKeyword);
    if (match) {
      return { type: 'help' };
    }

    // If the keyword is "index" send index
    match = line.match(indexKeyword);
    if (match) {
      if (match[1]) {
        const chapters = bibleInfo.chapters[match[1]];
        if (!chapters) {
          return { type: 'error', errorMessage: `Invalid OSIS ID: "${match[1]}"` };
        }
        return { type: 'index', bookId: match[1] };
      }

      return { type: 'index' };
    }

    // If the line is a space or empty string
    match = line.match(emptyLine);
    if (match) continue;

    // If there is no match
    errorMessage = `Invalid syntax: ${line}\nType "help" for a list of commands`;
    break;
  }

  if (parseResult.entities?.[0].osisObjects.length === 0 && errorMessage === null) {
    errorMessage = 'No citation specified. Try writing "(Genesis 1:1)"';
  }

  if (errorMessage) {
    parseResult = {
      type: 'error',
      errorMessage,
    };
  }

  return parseResult;
};

/**
 * Parses a version from a string comparing it with the available versions
 * @param string
 * @param availableVersions
 * @returns An object containing the extracted version or an error
 */
function extractVersion(string: string, availableVersions: Array<string>): ExtracResult {
  // Check if the version is valid
  if (!availableVersions.includes(string)) {
    return {
      type: 'error',
      errorMessage:
        `Not imported Bible version: ${string}\n` +
        'Available versions:\n' +
        `${availableVersions.toString().replace(/,/g, '\n')}`,
    };
  }
  return { type: 'version', version: string };
}

/**
 * Creates a new entity in the entities array of the ParseResult
 * @param entities
 * @param versions
 * @param options
 * @returns The result of the push
 */
function pushNewEntity(entities: Array<ParsedEntity>, versions: Array<string>, options?: EntityOptions): PushResult {
  const prevEntity = entities[entities.length - 1];

  // Check if the previous entity has osisIds
  if (prevEntity.osisObjects.length === 0) {
    // Check if the last version is 'default'
    if (prevEntity.versions[0] === 'default') {
      entities.pop();
    } else {
      return {
        type: 'error',
        errorMessage: 'You have to specify at least one citation before declaring a new version',
      };
    }
  }

  entities.push({
    osisObjects: [],
    versions,
    options,
  });

  return { type: 'success' };
}

interface ExtracResult {
  type: 'version' | 'error';
  version?: string;
  errorMessage?: string;
}

interface PushResult {
  type: 'success' | 'error';
  errorMessage?: string;
}
