import { describe, expect, test } from '@jest/globals';
import { flow } from './flow';

const identity = <T>(x: T) => x;
const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const toUpperCase = (string_: string) => string_.toUpperCase();
const greet = (string_: string) => `Hello, ${string_}`;

describe('flow', () => {
  test('composes two functions correctly', () => {
    const doubleAndAddOne = flow(double, addOne);

    expect(doubleAndAddOne(2)).toBe(5); // (2 * 2) + 1 = 5
    expect(doubleAndAddOne(0)).toBe(1); // (0 * 2) + 1 = 1
  });

  test('works with different types', () => {
    const toUpperCaseAndExclaim = flow(toUpperCase, greet);

    expect(toUpperCaseAndExclaim('world')).toBe('Hello, WORLD');
  });

  test('handles identity functions', () => {
    const identityFlow = flow(identity, identity);

    expect(identityFlow(42)).toBe(42);
    expect(identityFlow('foo')).toBe('foo');
  });
});
