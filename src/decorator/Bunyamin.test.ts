import { describe, expect, it, jest } from '@jest/globals';
import { Bunyamin } from './Bunyamin';
import { CategoryThreadDispatcher, MessageStack } from '../threads';

describe('Bunyamin', () => {
  it('should wrap the provided logger', () => {
    const logger = {
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const bunyamin = new Bunyamin({
      logger,
      dispatcher: new CategoryThreadDispatcher(100).registerCategories([
        'lifecycle',
        'child_process',
      ]),
      messageStack: new MessageStack(),
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
