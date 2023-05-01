export function getMainCategory(category: string | string[] | undefined): string {
  if (Array.isArray(category)) {
    return category[0];
  }

  if (category === undefined) {
    return 'undefined';
  }

  return String(category).split(',', 1)[0];
}
