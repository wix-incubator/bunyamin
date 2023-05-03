import { inflateCategories } from './inflateCategories';

export function getMainCategory(category: unknown) {
  return inflateCategories(category)[0] || '';
}
