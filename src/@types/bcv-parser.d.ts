interface OsisObject {
  osis: string;
  indices: number[];
  translations: string[];
  entity_id: number;
  entities: OsisEntity[];
}

interface OsisEntity {
  osis: string;
  type: 'bcv' | 'bc' | 'cv' | 'integer' | 'range';
  indices: number[];
  translations: string[];
  start: BCV;
  end: BCV;
  enclosed_indices: [number, number];
  entity_id: number;
  entities: OsisSubEntity[];
}

interface OsisSubEntity {
  start: BCV;
  end: BCV;
  valid: {
    valid: boolean;
    messages: object;
  };
  type: 'bcv' | 'bc' | 'cv' | 'integer' | 'range';
  absolute_indices: [number, number];
  enclosed_absolute_indices: [number, number];
}

interface BCV {
  b: string;
  c: number;
  v: number;
  type?: 'bcv' | 'bc' | 'cv' | 'integer' | 'range';
}

interface OsisBible {
  $: {
    osisIDWork: string;
  };
  div: OsisBook[];
}

interface OsisBook {
  $: {
    osisRefWork: string;
    osisIDWork: string;
    osisID: string;
  };
  chapter: OsisChapter[];
}

interface OsisChapter {
  $: {
    osisID: string;
  };
  verse: Verse[];
}

interface Verse {
  $: {
    osisID: string;
  };
  _: string;
}
