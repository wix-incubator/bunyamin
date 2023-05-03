import { deflateCategories } from './deflateCategories';
import { inflateCategories } from './inflateCategories';

export function mergeCategories(cat1: unknown, cat2: unknown): string | undefined {
  if (!cat1 || !cat2) {
    if (cat1) return deflateCategories(cat1);
    if (cat2) return deflateCategories(cat2);
    return undefined;
  }

  const categories1 = inflateCategories(cat1);
  const categories2 = inflateCategories(cat2);

  const categories = [...categories1, ...categories2];
  const uniqueCategories = new Set(categories);

  return [...uniqueCategories].join(',');
}
