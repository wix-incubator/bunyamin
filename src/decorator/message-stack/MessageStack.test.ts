/* eslint-disable unicorn/no-array-push-push */
import { describe, expect, test } from '@jest/globals';
import { MessageStack } from './MessageStack';
import type { ThreadID } from '../../types';

describe('MessageStack', () => {
  test.each([
    [undefined],
    [42],
    ['child_process'],
    [['child_process', undefined] as ThreadID],
    [['child_process', 31_028] as ThreadID],
  ])(`push and pop (tid=%j)`, (tid: ThreadID | undefined) => {
    const stack = new MessageStack();
    stack.push(tid, ['message']);
    expect(stack.pop(tid)).toEqual(['message']);
  });

  test('push, push, pop', () => {
    const stack = new MessageStack();
    stack.push('child_process', ['message 1']);
    stack.push('child_process', ['message 2']);
    expect(stack.pop('child_process')).toEqual(['message 2']);
  });

  test('simple and complex thread ids live separately', () => {
    const stack = new MessageStack();
    stack.push('child_process', ['message 1']);
    stack.push(['child_process', undefined], ['message 2']);

    expect(stack.pop('child_process')).toEqual(['message 1']);
    expect(stack.pop(['child_process', undefined])).toEqual(['message 2']);
  });

  test('pop() with no message pushed (default)', () => {
    const stack = new MessageStack();
    expect(stack.pop(42)).toEqual(['<no begin message>']);
  });

  test('pop() with no message pushed (custom)', () => {
    const stack = new MessageStack({ noBeginMessage: Number.NaN });
    expect(stack.pop(42)).toEqual([Number.NaN]);
  });
});
