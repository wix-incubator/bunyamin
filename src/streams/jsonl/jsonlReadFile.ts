import fs from 'node:fs';
import type { Readable } from 'node:stream';
import { Transform } from 'node:stream';
import StreamArray from 'stream-json/streamers/StreamArray';

export function jsonlReadFile(filePath: string): Readable {
  return fs
    .createReadStream(filePath, { encoding: 'utf8' })
    .pipe(StreamArray.withParser())
    .pipe(new MapValues());
}

class MapValues extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(
    record: unknown,
    _encoding: string,
    callback: (error?: Error | null, data?: unknown) => void,
  ) {
    this.push((record as JsonArrayEntry)?.value);
    callback();
  }
}

type JsonArrayEntry = { index: number; value: unknown };
