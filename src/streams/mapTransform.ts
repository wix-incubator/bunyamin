import { Transform } from 'stream';

export function mapTransform<T, U>(mapFunction: (chunk: T) => U) {
  return new Transform({
    objectMode: true,
    transform(chunk, _encoding, callback) {
      this.push(mapFunction(chunk));
      callback();
    },
  });
}
