import { describe, expect, test } from '@jest/globals';
import { bunyan2trace } from './bunyan2trace';
import * as make from './__fixtures__/bunyanEvents';

describe('bunyan2trace', () => {
  describe('InstantEvent', () => {
    test('is returned for ph = "i"', () => {
      const record = make.anInstantEvent();
      expect(bunyan2trace(record)).toEqual({
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
      const record = make.anInstantEvent();
      record.ph = 'W';

      expect(bunyan2trace(record).ph).toBe('i');
    });

    test('is returned for undefined ph', () => {
      const record = make.anInstantEvent();
      delete record.ph;
      expect(bunyan2trace(record).ph).toBe('i');
    });

    test('has sf and stack for thread-scoped events', () => {
      const record = make.anInstantEvent('t');
      expect(bunyan2trace(record)).toHaveProperty('sf');
      expect(bunyan2trace(record)).toHaveProperty('stack');
    });

    test('has no sf and stack for global-scoped events', () => {
      const record = make.anInstantEvent('g');
      expect(bunyan2trace(record)).not.toHaveProperty('sf');
      expect(bunyan2trace(record)).not.toHaveProperty('stack');
    });

    test('has no sf and stack for process-scoped events', () => {
      const record = make.anInstantEvent('p');
      expect(bunyan2trace(record)).not.toHaveProperty('sf');
      expect(bunyan2trace(record)).not.toHaveProperty('stack');
    });
  });

  describe('DurationBeginEvent', () => {
    test('is returned for ph = "B"', () => {
      const record = make.aDurationBeginEvent();
      expect(bunyan2trace(record)).toMatchInlineSnapshot(`
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
      const record = make.aDurationEndEvent();
      expect(bunyan2trace(record)).toMatchInlineSnapshot(`
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
