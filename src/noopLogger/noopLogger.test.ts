import { describe, expect, jest, test } from '@jest/globals';
import type { BunyanLogLevel } from '../decorator';
import { noopLogger } from './noopLogger';
import { Bunyamin } from '../decorator';

function wrapNoopLogger(): Bunyamin {
  return new Bunyamin({
    logger: noopLogger(),
  });
}

const LOG_LEVELS: BunyanLogLevel[] = ['debug', 'error', 'fatal', 'info', 'trace', 'warn'];

describe('noopLogger()', () => {
  test('returns an object with all log methods', () => {
    const logMethods = Object.keys(noopLogger()) as BunyanLogLevel[];
    expect(logMethods.sort()).toEqual(LOG_LEVELS);
  });

  test.each(LOG_LEVELS)('works well with wrapped %s method invocations', (_level) => {
    const level = _level as BunyanLogLevel;
    const bunyamin = wrapNoopLogger();
    const logMethod = jest.spyOn(bunyamin.logger, level);

    expect(
      bunyamin[level].complete('test message', () => {
        bunyamin[level]('inner message');
        return 42;
      }),
    ).toBe(42);

    expect(logMethod).toHaveBeenCalledWith(expect.objectContaining({ ph: 'B' }), 'test message');
    expect(logMethod).toHaveBeenCalledWith(expect.objectContaining({}), 'inner message');
    expect(logMethod).toHaveBeenCalledWith(expect.objectContaining({ ph: 'E' }), 'test message');
    expect(logMethod).toHaveBeenCalledTimes(3);
  });
});
