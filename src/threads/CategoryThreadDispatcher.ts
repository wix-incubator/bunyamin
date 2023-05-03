import { getMainCategory } from '../categories';
import { ThreadDispatcher } from './ThreadDispatcher';

export class CategoryThreadDispatcher {
  #categoriesCount = 0;
  readonly #dispatchers: Record<string, ThreadDispatcher> = {};
  readonly #maxConcurrency: number;

  constructor(maxConcurrency: number) {
    this.#maxConcurrency = maxConcurrency;
  }

  registerCategories(categories: string[]): this {
    for (const category of categories) {
      this.#ensureCategoryDispatcher(category);
    }

    return this;
  }

  resolve(
    ph: 'B' | 'E' | 'i' | undefined,
    cat: string | string[] | undefined,
    id: unknown,
  ): number {
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
    return this.#ensureCategoryDispatcher(getMainCategory(cat));
  }

  #ensureCategoryDispatcher(mainCategory: string): ThreadDispatcher {
    if (!this.#dispatchers[mainCategory]) {
      const offset = this.#categoriesCount++ * this.#maxConcurrency;
      this.#dispatchers[mainCategory] = new ThreadDispatcher(mainCategory, offset);
    }

    return this.#dispatchers[mainCategory];
  }
}
