import type { BunyanReservedProperty } from '../types';
import { thisHasKey, mapKeys } from '../utils';
import { RESERVED_PROPERTIES } from '../constants';

export function sanitizeBunyanContext<T extends Record<string, any>>(context: T): T {
  return hasReservedProperties(context) ? mapKeys<T, T>(context, escapeCallback) : context;
}

function hasReservedProperties(
  context: object,
): context is Partial<Record<BunyanReservedProperty, unknown>> {
  return context ? RESERVED_PROPERTIES.some(thisHasKey, context) : false;
}

function escapeCallback<T, K extends keyof T>(_value: T[K], key: K) {
  return RESERVED_PROPERTIES.includes(key as BunyanReservedProperty) ? `${String(key)}$` : key;
}
