export function isObject(value: any): value is object {
  return value ? typeof value === 'object' : false;
}

