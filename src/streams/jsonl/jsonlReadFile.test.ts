import { existsSync } from 'node:fs';
import tempy from 'tempy';
import { writeFile, unlink } from 'node:fs/promises';

import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';

import { jsonlReadFile } from './jsonlReadFile';

describe('jsonlReadFile', () => {
  let temporaryFilePath: string;

  beforeEach(() => {
    temporaryFilePath = tempy.file();
  });

  afterEach(async () => {
    if (temporaryFilePath && existsSync(temporaryFilePath)) {
      await unlink(temporaryFilePath);
    }
  });

  it.each([
    ['empty array', [], []],
    ['single-line array', [{ a: 1 }, { b: 2 }, { c: 3 }], []],
    ['multi-line array', [{ a: 1 }, { b: 2 }, { c: 3 }], [null, 2]],
  ])('should deserialize %s', async (_comment, value: unknown, options: any[]) => {
    const json = JSON.stringify(value, ...options);
    await writeFile(temporaryFilePath, json + '\n');

    const chunks: unknown[] = [];
    for await (const chunk of jsonlReadFile(temporaryFilePath)) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(value);
  });
});
