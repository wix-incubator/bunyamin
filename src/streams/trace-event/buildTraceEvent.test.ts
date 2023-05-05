import { describe, expect, test } from '@jest/globals';
import { buildTraceEvent } from './buildTraceEvent';

describe('buildTraceEvent', () => {
  describe('InstantEvent', () => {
    test('is returned for ph = "i"', () => {
      const record = anInstantEvent();
      expect(buildTraceEvent(record)).toEqual({
        args: {
          custom: 'value',
        },
        cat: 'lifecycle',
        cname: '#f00',
        name: 'The event name',
        ph: 'i',
        pid: 42,
        tid: 0,
        s: 't',
        sf: 0,
        stack: [],
        ts: 1_609_459_200_000_000,
        tts: 1_683_314_088_734,
      });
    });

    test('is returned for unrecognized ph', () => {
      const record = anInstantEvent();
      record.ph = 'W';

      expect(buildTraceEvent(record).ph).toBe('i');
    });

    test('is returned for undefined ph', () => {
      const record = anInstantEvent();
      delete record.ph;
      expect(buildTraceEvent(record).ph).toBe('i');
    });

    test('has sf and stack for thread-scoped events', () => {
      const record = anInstantEvent('t');
      expect(buildTraceEvent(record)).toHaveProperty('sf');
      expect(buildTraceEvent(record)).toHaveProperty('stack');
    });

    test('has no sf and stack for global-scoped events', () => {
      const record = anInstantEvent('g');
      expect(buildTraceEvent(record)).not.toHaveProperty('sf');
      expect(buildTraceEvent(record)).not.toHaveProperty('stack');
    });

    test('has no sf and stack for process-scoped events', () => {
      const record = anInstantEvent('p');
      expect(buildTraceEvent(record)).not.toHaveProperty('sf');
      expect(buildTraceEvent(record)).not.toHaveProperty('stack');
    });
  });

  describe('DurationBeginEvent', () => {
    test('is returned for ph = "B"', () => {
      const record = aDurationBeginEvent();
      expect(buildTraceEvent(record)).toMatchInlineSnapshot(`
        {
          "args": {
            "custom": "value",
          },
          "cat": "lifecycle",
          "cname": "#f00",
          "name": "The event name",
          "ph": "B",
          "pid": 42,
          "sf": 0,
          "stack": [],
          "tid": 0,
          "ts": 1609459200000000,
          "tts": 1683314088734,
        }
      `);
    });
  });

  describe('DurationEndEvent', () => {
    test('is returned for ph = "E"', () => {
      const record = aDurationEndEvent();
      expect(buildTraceEvent(record)).toMatchInlineSnapshot(`
        {
          "args": {
            "custom": "value",
          },
          "cname": "#f00",
          "ph": "E",
          "pid": 42,
          "sf": 0,
          "stack": [],
          "tid": 0,
          "ts": 1609459200000000,
          "tts": 1683314088734,
        }
      `);
    });
  });
});

function anEvent() {
  return {
    cat: 'lifecycle',
    cname: '#f00', // not sure about the correct color format
    custom: 'value',
    hostname: 'ignored',
    msg: 'The event name',
    name: 'ignored',
    pid: 42,
    tid: 0,
    time: '2021-01-01T00:00:00.000Z',
    tts: 1_683_314_088_734,
  };
}

function anEventWithStack() {
  return {
    ...anEvent(),
    sf: 0,
    stack: [],
  };
}

function anInstantEvent(s = 't'): any {
  return {
    ...anEventWithStack(),
    ph: 'i',
    s,
  };
}

function aDurationBeginEvent(): any {
  return {
    ...anEventWithStack(),
    ph: 'B',
  };
}

function aDurationEndEvent() {
  return {
    ...anEventWithStack(),
    ph: 'E',
  };
}
