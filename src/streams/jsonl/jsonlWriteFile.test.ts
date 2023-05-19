import { existsSync } from 'node:fs';
import { readFile, unlink } from 'node:fs/promises';
import type { Writable } from 'node:stream';

import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import tempy from 'tempy';

import { jsonlWriteFile } from './jsonlWriteFile';

describe('jsonlWriteFile', () => {
  let temporaryFilePath: string;
  let jsonl: Writable;

  beforeEach(() => {
    temporaryFilePath = tempy.file();
    jsonl = jsonlWriteFile(temporaryFilePath);
  });

  afterEach(async () => {
    if (!jsonl.destroyed) {
      jsonl.destroy();
    }

    if (temporaryFilePath && existsSync(temporaryFilePath)) {
      await unlink(temporaryFilePath);
    }
  });

  it('should serialize 0 objects', async () => {
    await new Promise<void>((resolve, reject) => {
      jsonl.end((error: unknown) => (error ? reject(error) : resolve()));
    });

    expect(await readFile(temporaryFilePath, 'utf8')).toEqual('[]\n');
  });

  it('should serialize 1 object', async () => {
    await new Promise<void>((resolve, reject) => {
      jsonl.write({ a: 1 });
      jsonl.end((error: unknown) => (error ? reject(error) : resolve()));
    });

    expect(await readFile(temporaryFilePath, 'utf8')).toEqual('[{"a":1}]\n');
  });

  it('should serialize 2 objects', async () => {
    await new Promise<void>((resolve, reject) => {
      jsonl.write({ a: 1 });
      jsonl.write({ b: 2 });
      jsonl.end((error: unknown) => (error ? reject(error) : resolve()));
    });

    expect(await readFile(temporaryFilePath, 'utf8')).toEqual('[{"a":1},\n{"b":2}]\n');
  });

  it('should serialize 3 objects', async () => {
    await new Promise<void>((resolve, reject) => {
      jsonl.write({ a: 1 });
      jsonl.write({ b: 2 });
      jsonl.write({ c: 3 });
      jsonl.end((error: unknown) => (error ? reject(error) : resolve()));
    });

    expect(await readFile(temporaryFilePath, 'utf8')).toEqual('[{"a":1},\n{"b":2},\n{"c":3}]\n');
  });

  it('should serialize primitives', async () => {
    await new Promise<void>((resolve, reject) => {
      jsonl.write(42);
      jsonl.write('foo');
      jsonl.end((error: unknown) => (error ? reject(error) : resolve()));
    });

    expect(await readFile(temporaryFilePath, 'utf8')).toEqual(`[42,\n"foo"]\n`);
  });
});
