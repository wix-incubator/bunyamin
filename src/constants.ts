import type { BunyanReservedProperty } from './types';

export const RESERVED_PROPERTIES = Object.keys({
  hostname: 0,
  level: 1,
  msg: 2,
  name: 3,
  ph: 4,
  pid: 5,
  tid: 6,
  time: 7,
} as Record<BunyanReservedProperty, number>) as BunyanReservedProperty[];
