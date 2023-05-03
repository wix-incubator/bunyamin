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
  if (categories1.length === 0 || categories2.length === 0) {
    if (categories1.length === 0) return deflateCategories(cat2);
    if (categories2.length === 0) return deflateCategories(cat1);
    return undefined;
  }

  const categories = [...categories1, ...categories2];
  const uniqueCategories = new Set(categories);

  return [...uniqueCategories].join(',');
}
