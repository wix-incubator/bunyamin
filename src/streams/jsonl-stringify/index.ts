import { JSONLStringer } from './JSONLStringer';

export function serializeJSONL() {
  return new JSONLStringer({
    replacer: undefined,
    header: '',
    delimiter: '\n',
    footer: '',
  });
}

export function serializeJSON() {
  return new JSONLStringer({
    replacer: undefined,
    header: '[\n\t',
    delimiter: ',\n\t',
    footer: '\n]\n',
  });
}
