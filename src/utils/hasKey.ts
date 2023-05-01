export function hasKey<T extends object, K extends string>(
  object: T,
  key: K,
): object is T & Record<K, unknown> {
  return object && key in object;
}
