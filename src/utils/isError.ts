export function isError(value: any): value is Error {
  return value instanceof Error;
}
