import { hasKey } from './hasKey';

export function thisHasKey(this: object, key: string): boolean {
  return hasKey(this, key);
}
