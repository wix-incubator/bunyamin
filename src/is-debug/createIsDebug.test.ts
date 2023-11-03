import { describe, expect, it } from '@jest/globals';
import { createIsDebug } from './createIsDebug';

const enabled = (namespace: string, pattern: string) => createIsDebug(pattern)(namespace);

describe('is-debug', function () {
  it('supports wildcards', function () {
    const variable = 'b*';

    expect(enabled('bigpipe', variable)).toBe(true);
    expect(enabled('bro-fist', variable)).toBe(true);
    expect(enabled('ro-fist', variable)).toBe(false);
  });

  it('is disabled by default', function () {
    expect(enabled('bigpipe', '')).toBe(false);
    expect(enabled('bigpipe', 'bigpipe')).toBe(true);
  });

  it('can ignore loggers using a -', function () {
    const DEBUG = 'bigpipe,-primus,sack,-other';

    expect(enabled('bigpipe', DEBUG)).toBe(true);
    expect(enabled('sack', DEBUG)).toBe(true);
    expect(enabled('primus', DEBUG)).toBe(false);
    expect(enabled('other', DEBUG)).toBe(false);
    expect(enabled('unknown', DEBUG)).toBe(false);
  });

  it('supports multiple ranges', function () {
    const DEBUG = 'bigpipe*,primus*';

    expect(enabled('bigpipe:', DEBUG)).toBe(true);
    expect(enabled('bigpipes', DEBUG)).toBe(true);
    expect(enabled('primus:', DEBUG)).toBe(true);
    expect(enabled('primush', DEBUG)).toBe(true);
    expect(enabled('unknown', DEBUG)).toBe(false);
  });
});
