import type { Event } from 'trace-event-lib';
import multiSortStream from 'multi-sort-stream';

import type { Readable } from 'node:stream';

import { jsonlReadFile } from '../jsonl';
import { Transform } from 'node:stream';

export function traceMerge(filePaths: string[]): Readable {
  const streams = filePaths.map((filePath) => jsonlReadFile(filePath));
  // eslint-disable-next-line unicorn/consistent-function-scoping
  return multiSortStream(streams, comparator).pipe(new TraceMerge());
}

function comparator(a: unknown, b: unknown): number {
  const aa = a as Event;
  const bb = b as Event;

  return aa.ts < bb.ts ? -1 : aa.ts > bb.ts ? 1 : 0;
}

class TraceMerge extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(
    record: unknown,
    _encoding: string,
    callback: (error?: Error | null, data?: unknown) => void,
  ) {
    // TODO: implement pid and tid resolution
    this.push(record);
    callback();
  }
}
