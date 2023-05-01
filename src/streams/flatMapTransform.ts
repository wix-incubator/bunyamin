import { thisPush } from '../utils';

import { Transform } from 'stream';

export function flatMapTransform<T, U>(mapFunction: (chunk: T, index: number) => U[]) {
  let index = 0;

  return new Transform({
    objectMode: true,
    transform(chunk, _encoding, callback) {
      const results = mapFunction(chunk, index++);
      // eslint-disable-next-line unicorn/no-array-for-each
      results.forEach(thisPush, this);
      callback();
    },
  });
}
