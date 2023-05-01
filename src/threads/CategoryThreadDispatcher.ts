import { getMainCategory } from './getMainCategory';
import { ThreadDispatcher } from './ThreadDispatcher';

export class CategoryThreadDispatcher {
  readonly #dispatchers: Record<string, ThreadDispatcher> = {};

  resolve(ph: 'B' | 'E' | 'i', cat: string | string[] | undefined, id: string | number): number {
    const dispatcher = this.#resolveDispatcher(cat);

    switch (ph) {
      case 'B': {
        return dispatcher.begin(id);
      }
      case 'E': {
        return dispatcher.end(id);
      }
      default: {
        return dispatcher.resolve(id);
      }
    }
  }

  #resolveDispatcher(cat: string[] | string | undefined): ThreadDispatcher {
    const mainCategory = getMainCategory(cat);
    if (!this.#dispatchers[mainCategory]) {
      this.#dispatchers[mainCategory] = new ThreadDispatcher(mainCategory);
    }

    return this.#dispatchers[mainCategory];
  }
}
