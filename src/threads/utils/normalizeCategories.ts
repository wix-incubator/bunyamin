export function normalizeCategories(cat: unknown): string[] {
  if (!cat) {
    return [];
  }

  if (Array.isArray(cat)) {
    return cat as string[];
  }

  return String(cat).split(',');
}
