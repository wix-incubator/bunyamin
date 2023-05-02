import { normalizeCategories } from './normalizeCategories';

export function mergeCategories(cat1: unknown, cat2: unknown): string {
  const categories1 = normalizeCategories(cat1);
  const categories2 = normalizeCategories(cat2);

  const categories = [...categories1, ...categories2];
  const uniqueCategories = new Set(categories);

  return [...uniqueCategories].join(',');
}
