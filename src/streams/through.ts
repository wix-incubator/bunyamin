import { PassThrough } from 'stream';

export function through() {
  return new PassThrough({ objectMode: true });
}
