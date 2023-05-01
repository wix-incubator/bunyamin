export function mapKeys<T extends Record<string, any>, U extends Record<string, any>>(
  object: T,
  mapFunction: <K extends keyof T>(value: T[K], key: K) => keyof U,
): U {
  const result = {} as U;

  for (const [key, value] of Object.entries(object)) {
    result[mapFunction(value, key)] = value;
  }

  return result;
}
