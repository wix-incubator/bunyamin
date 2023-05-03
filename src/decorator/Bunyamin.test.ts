import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import { Bunyamin } from './Bunyamin';
import type { BunyanLikeLogger, BunyanLogLevel } from './types';

describe('Bunyamin', () => {
  const LEVELS: [BunyanLogLevel][] = [
    ['fatal'],
    ['error'],
    ['warn'],
    ['info'],
    ['debug'],
    ['trace'],
  ];

  let logger: MockLogger;
  let bunyamin: Bunyamin<MockLogger>;

  beforeEach(() => {
    logger = new MockLogger();
    bunyamin = new Bunyamin({
      logger,
      maxConcurrency: 100,
      threads: ['lifecycle', 'child_process'],
    });
  });

  test('bunyamin.logger', () => {
    expect(bunyamin.logger).toBe(logger);
  });

  test.each(LEVELS)('bunyamin.%s(message)', (level) => {
    bunyamin[level]('message');
    expect(logger[level]).toHaveBeenCalledWith({ tid: 0 }, 'message');
  });

  test.each(LEVELS)('bunyamin.%s(fields, message)', (level) => {
    bunyamin[level]({ cat: 'exec' }, 'message');
    expect(logger[level]).toHaveBeenCalledWith({ tid: 0, cat: 'exec' }, 'message');
  });

  test.each(LEVELS)(
    'bunyamin.child(fields).%s(message) <==> bunyamin[level](fields, message)',
    (level) => {
      bunyamin.child({ cat: 'test' })[level]('message');
      expect(logger[level]).toHaveBeenCalledWith({ cat: 'test', tid: 0 }, 'message');
    },
  );

  test.each(LEVELS)('bunyamin.%s(error)', (level) => {
    const error = new Error('Something');
    bunyamin[level](error);
    expect(logger[level]).toHaveBeenCalledWith({ tid: 0, err: error }, error.message);
  });

  test.each(LEVELS)('bunyamin.%s(error, message)', (level) => {
    const error = new Error('Something');
    bunyamin[level](error, 'custom message');
    expect(logger[level]).toHaveBeenCalledWith({ tid: 0, err: error }, 'custom message');
  });

  test.each(LEVELS)('bunyamin.%s.begin(message)', (level) => {
    bunyamin[level].begin('message');
    expect(logger[level]).toHaveBeenCalledWith({ tid: 0, ph: 'B' }, 'message');
  });

  test.each(LEVELS)('bunyamin.%s.end(): empty stack', (level) => {
    bunyamin[level].end();
    expect(logger[level]).toHaveBeenCalledWith({ tid: 0, ph: 'E' }, '<no begin message>');
  });

  test.each(LEVELS)('bunyamin.%s.end(): non-empty stack', (level) => {
    bunyamin[level].begin('message');
    bunyamin[level].end();
    expect(logger[level]).toHaveBeenCalledWith({ tid: 0, ph: 'E' }, 'message');
  });

  test.each(LEVELS)('bunyamin.%s.end(message)', (level) => {
    bunyamin[level].end('message');
    expect(logger[level]).toHaveBeenCalledWith({ tid: 0, ph: 'E' }, 'message');
  });

  test.each(LEVELS)('bunyamin.%s.complete(message, value)', (level) => {
    const result = bunyamin[level].complete('Something', 42);

    expect(result).toBe(42);
    expect(logger[level]).toHaveBeenCalledWith({ ph: 'B', tid: 0 }, 'Something');
    expect(logger[level]).toHaveBeenCalledWith({ ph: 'E', tid: 0, success: true }, 'Something');
  });

  test.each(LEVELS)('bunyamin.%s.complete(message, pendingPromise)', async (level) => {
    const resolve = jest.fn();
    const promise = new Promise((resolve_) => {
      resolve.mockImplementation(resolve_);
    });

    const result = bunyamin[level].complete('Pending', promise);
    expect(logger[level]).toHaveBeenCalledWith({ ph: 'B', tid: 0 }, 'Pending');
    expect(logger[level]).not.toHaveBeenCalledWith(
      expect.objectContaining({ ph: 'E' }),
      expect.anything(),
    );

    resolve(84);
    expect(await result).toBe(84);
    expect(logger[level]).toHaveBeenCalledWith({ ph: 'E', tid: 0, success: true }, 'Pending');
  });

  test.each(LEVELS)('bunyamin.%s.complete(message, rejectedPromise)', async (level) => {
    const error = new Error('Fake error');
    await expect(bunyamin[level].complete('Promise test', Promise.reject(error))).rejects.toThrow(
      'Fake error',
    );
    expect(logger[level]).toHaveBeenCalledWith({ ph: 'B', tid: 0 }, 'Promise test');
    expect(logger[level]).toHaveBeenCalledWith(
      { ph: 'E', tid: 0, success: false, err: error },
      'Promise test',
    );
  });

  test.each(LEVELS)('bunyamin.%s.complete(message, syncFnPass)', async (level) => {
    const result = bunyamin[level].complete('Sync fn test', () => 42);

    expect(result).toBe(42);
    expect(logger[level]).toHaveBeenCalledWith({ ph: 'B', tid: 0 }, 'Sync fn test');
    expect(logger[level]).toHaveBeenCalledWith({ ph: 'E', tid: 0, success: true }, 'Sync fn test');
  });

  test.each(LEVELS)('bunyamin.%s.complete(message, syncFnThrow)', async (level) => {
    const error = new Error('Fake error');
    expect(() =>
      bunyamin[level].complete('Sync fn throw', () => {
        throw error;
      }),
    ).toThrow('Fake error');

    expect(logger[level]).toHaveBeenCalledWith({ ph: 'B', tid: 0 }, 'Sync fn throw');
    expect(logger[level]).toHaveBeenCalledWith(
      { ph: 'E', tid: 0, success: false, err: error },
      'Sync fn throw',
    );
  });

  test.each(LEVELS)('bunyamin.%s.complete(message, asyncFnPass)', async (level) => {
    const result = await bunyamin[level].complete('Async fn test', async () => 42);

    expect(result).toBe(42);
    expect(logger[level]).toHaveBeenCalledWith({ ph: 'B', tid: 0 }, 'Async fn test');
    expect(logger[level]).toHaveBeenCalledWith({ ph: 'E', tid: 0, success: true }, 'Async fn test');
  });

  test.each(LEVELS)('bunyamin.%s.complete(message, asyncFnThrow)', async (level) => {
    const error = new Error('Fake error');
    await expect(() =>
      bunyamin[level].complete('Async fn throw', async () => {
        throw error;
      }),
    ).rejects.toThrow('Fake error');

    expect(logger[level]).toHaveBeenCalledWith({ ph: 'B', tid: 0 }, 'Async fn throw');
    expect(logger[level]).toHaveBeenCalledWith(
      { ph: 'E', tid: 0, success: false, err: error },
      'Async fn throw',
    );
  });

  test.each(LEVELS)('bunyamin.%s.complete(fields, message, action)', (level) => {
    const result = bunyamin[level].complete({ hello: 'world' }, 'Something', () => 42);

    expect(result).toBe(42);
    expect(logger[level]).toHaveBeenCalledWith({ ph: 'B', tid: 0, hello: 'world' }, 'Something');
    expect(logger[level]).toHaveBeenCalledWith({ ph: 'E', tid: 0, success: true }, 'Something');
  });

  describe('sanitization', () => {
    test('should omit ph', () => {
      bunyamin.info({ ph: 'B' }, 'message');
      expect(logger.info).toHaveBeenCalledWith({ tid: 0 }, 'message');
    });
  });

  describe('cat (categories) merging', () => {
    test('should join categories', () => {
      const child = bunyamin.child({ cat: 'category1' });
      child.info({ cat: 'category2' }, 'message');
      expect(logger.info).toHaveBeenCalledWith({ tid: 0, cat: 'category1,category2' }, 'message');
    });

    test('should omit duplicate categories', () => {
      const child = bunyamin.child({ cat: 'category1' });
      child.info({ cat: 'category1' }, 'message');
      expect(logger.info).toHaveBeenCalledWith({ tid: 0, cat: 'category1' }, 'message');
    });

    test('should handle comma-separated categories', () => {
      const child = bunyamin.child({ cat: 'category1,category2' });
      child.info({ cat: 'category3,category1' }, 'message');
      expect(logger.info).toHaveBeenCalledWith(
        { tid: 0, cat: 'category1,category2,category3' },
        'message',
      );
    });

    test('should handle array categories', () => {
      const child = bunyamin.child({ cat: ['category1', 'category2'] });
      child.info({ cat: ['category3', 'category1'] }, 'message');
      expect(logger.info).toHaveBeenCalledWith(
        { tid: 0, cat: 'category1,category2,category3' },
        'message',
      );
    });
  });

  describe('thread (tid) allocation', () => {
    test('should use explicit tid when provided', () => {
      bunyamin.info({ tid: 42 }, 'message');
      expect(logger.info).toHaveBeenCalledWith({ tid: 42 }, 'message');
    });

    test('should use resolve thread group aliases', () => {
      bunyamin.info({ tid: 'lifecycle' }, 'L-message');
      expect(logger.info).toHaveBeenCalledWith({ tid: 100 }, 'L-message');
      bunyamin.info({ tid: 'child_process' }, 'CP-message');
      expect(logger.info).toHaveBeenCalledWith({ tid: 200 }, 'CP-message');
    });
  });

  class MockLogger implements BunyanLikeLogger {
    fatal = jest.fn();
    trace = jest.fn();
    debug = jest.fn();
    info = jest.fn();
    warn = jest.fn();
    error = jest.fn();
  }
});
