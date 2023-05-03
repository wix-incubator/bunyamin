import { describe, expect, it, jest } from '@jest/globals';
import { Bunyamin } from './Bunyamin';

describe('Bunyamin', () => {
  it('should wrap the provided logger', () => {
    const logger = {
      fatal: jest.fn(),
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const bunyamin = new Bunyamin({
      logger,
      maxConcurrency: 100,
      categories: ['lifecycle', 'child_process'],
    });

    bunyamin.trace('trace');

    expect(logger.trace).toHaveBeenCalledWith({ cat: 'custom', tid: 200 }, 'trace');

    const result = bunyamin.debug.complete(
      { cat: 'lifecycle', hello: 'world' },
      'Something',
      () => 42,
    );

    expect(result).toBe(42);
    expect(logger.debug).toHaveBeenCalledWith(
      { cat: 'lifecycle', hello: 'world', ph: 'B', tid: 0 },
      'Something',
    );
    expect(logger.debug).toHaveBeenCalledWith(
      { ph: 'E', cat: 'lifecycle', tid: 0, success: true },
      'Something',
    );
  });
});
