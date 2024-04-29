import { beforeEach, describe, expect, it } from '@jest/globals';
import { ThreadGroupDispatcher } from './ThreadGroupDispatcher';

const PHASES = [undefined, 'i', 'B', 'E'] as const;

describe('ThreadGroupDispatcher', () => {
  let dispatcher: ThreadGroupDispatcher;

  beforeEach(() => {
    dispatcher = new ThreadGroupDispatcher({
      defaultThreadName: 'Main Thread',
      maxConcurrency: 100,
      strict: false,
      threadGroups: [
        { id: 'foo', displayName: 'A' },
        { id: 'bar', displayName: 'B', maxConcurrency: 2 },
        { id: 'baz', displayName: 'C', maxConcurrency: 3 },
      ],
    });
  });

  it.each(PHASES)('should fallback to 0 for null tid (ph = %j)', (ph) => {
    expect(dispatcher.resolve(ph, void 0)).toBe(0);
    expect(dispatcher.resolve(ph, null as any)).toBe(0);
  });

  it.each(PHASES)('should pass through numeric tid (ph = %j)', (ph) => {
    expect(dispatcher.resolve(ph, 1)).toBe(1);
  });

  it.each(PHASES)('should support thread groups (ph = %j)', (ph) => {
    expect(dispatcher.resolve(ph, 'foo')).toBe(1);
  });

  it.each(PHASES)('should support thread groups with default maxConcurrency (ph = %j)', (ph) => {
    expect(dispatcher.resolve(ph, 'bar')).toBe(101);
  });

  it.each(PHASES)('should support thread groups with custom maxConcurrency (ph = %j)', (ph) => {
    expect(dispatcher.resolve(ph, 'baz')).toBe(103);
  });

  it('should allocate thread ids sequentially', () => {
    expect(dispatcher.resolve('B', 'foo')).toBe(1);
    expect(dispatcher.resolve('B', ['foo', 'id1'])).toBe(2);
    expect(dispatcher.resolve('B', ['foo', 'id2'])).toBe(3);

    expect(dispatcher.resolve('i', 'foo')).toBe(1);
    expect(dispatcher.resolve('i', ['foo', 'id1'])).toBe(2);
    expect(dispatcher.resolve('i', ['foo', 'id2'])).toBe(3);

    expect(dispatcher.resolve('E', 'foo')).toBe(1);
    expect(dispatcher.resolve('E', ['foo', 'id1'])).toBe(2);
    expect(dispatcher.resolve('E', ['foo', 'id2'])).toBe(3);
  });

  it('should get thread group display name by tid', () => {
    expect(dispatcher.name(0)).toBe('Main Thread');
    expect(dispatcher.name(1)).toBe('A');
    expect(dispatcher.name(100)).toBe('A');
    expect(dispatcher.name(101)).toBe('B');
    expect(dispatcher.name(102)).toBe('B');
    expect(dispatcher.name(103)).toBe('C');
    expect(dispatcher.name(105)).toBe('C');
    expect(dispatcher.name(106)).toBe(undefined);
  });

  it('should ignore undefined sub-ids', () => {
    expect(dispatcher.resolve('B', 'bar')).toBe(101);
    expect(dispatcher.resolve('B', ['bar', undefined])).toBe(101);
  });

  describe('in strict mode', function () {
    beforeEach(() => {
      dispatcher = new ThreadGroupDispatcher({
        defaultThreadName: 'Main Thread',
        maxConcurrency: 2,
        strict: true,
        threadGroups: [
          {
            id: 'foo',
            displayName: 'A',
          },
        ],
      });
    });

    it('should return an error when resolving unknown thread group', () => {
      const error = dispatcher.resolve('B', 'bar');
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'Unknown thread group "bar"');
    });

    it.each(PHASES)('should return an error when ran out of thread ids (ph = %j)', (ph) => {
      expect(dispatcher.resolve('B', ['foo', 'id1'])).toBe(1);
      expect(dispatcher.resolve('B', ['foo', 'id2'])).toBe(2);

      const error = dispatcher.resolve(ph, 'foo');
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty(
        'message',
        'Exceeded limit of 2 concurrent threads in group "A"',
      );

      expect(dispatcher.resolve('E', ['foo', 'id1'])).toBe(1);
      expect(dispatcher.resolve('B', 'foo')).toBe(1);
    });

    it('should not pluralize an error message if the limit is 1', () => {
      dispatcher = new ThreadGroupDispatcher({
        defaultThreadName: 'Main Thread',
        maxConcurrency: 1,
        strict: true,
        threadGroups: [
          {
            id: 'foo',
            displayName: 'Single Thread',
          },
        ],
      });

      expect(dispatcher.resolve('B', 'foo')).toBe(1);
      const error = dispatcher.resolve('B', ['foo', 'id1']);
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty(
        'message',
        'Exceeded limit of 1 concurrent thread in group "Single Thread"',
      );
    });
  });

  describe('in non-strict mode', function () {
    beforeEach(() => {
      dispatcher = new ThreadGroupDispatcher({
        defaultThreadName: 'Main Thread',
        maxConcurrency: 2,
        strict: false,
        threadGroups: [
          {
            id: 'foo',
            displayName: 'A',
          },
        ],
      });
    });

    it('should automatically register unknown thread groups', () => {
      expect(dispatcher.resolve('B', 'bar')).toBe(3);
      expect(dispatcher.resolve('B', 'baz')).toBe(5);
    });

    it.each(PHASES)('should return max tid when ran out of thread ids (ph = %j)', (ph) => {
      expect(dispatcher.resolve('B', ['foo', 'id1'])).toBe(1);
      expect(dispatcher.resolve('B', ['foo', 'id2'])).toBe(2);

      expect(dispatcher.resolve(ph, 'foo')).toBe(2);

      expect(dispatcher.resolve('E', ['foo', 'id1'])).toBe(1);
      expect(dispatcher.resolve(ph, 'foo')).toBe(1);
    });
  });
});
