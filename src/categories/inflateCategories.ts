export function inflateCategories(cat: unknown): string[] {
  if (!cat) {
    return [];
  }

  if (Array.isArray(cat)) {
    return cat.filter(Boolean) as string[];
  }

  return String(cat).split(',');
}
