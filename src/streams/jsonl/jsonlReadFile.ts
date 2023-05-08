import fs from 'node:fs';
import type { Readable } from 'node:stream';
import parser from 'stream-json';

export function jsonlReadFile(filePath: string): Readable {
  return fs.createReadStream(filePath, { encoding: 'utf8' }).pipe(
    parser({
      streamValues: true,
    }),
  );
}
