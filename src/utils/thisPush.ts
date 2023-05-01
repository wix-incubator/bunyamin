export function thisPush<T, A extends T[]>(this: A, item: T): void {
  this.push(item);
}
