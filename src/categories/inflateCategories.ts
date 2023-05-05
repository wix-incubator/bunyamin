export function inflateCategories(cat: unknown): string[] {
  if (!cat) {
    return [];
  }

  if (Array.isArray(cat)) {
    return cat.filter(Boolean).map(String);
  }

  return String(cat).split(',').filter(Boolean);
}
