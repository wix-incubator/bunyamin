import { ThreadDispatcher } from './ThreadDispatcher';
import type { ThreadAlias } from '../decorator';

export class ThreadGroupDispatcher {
  #categoriesCount = 0;
  readonly #dispatchers: Record<string, ThreadDispatcher> = {};
  readonly #maxConcurrency: number;

  constructor(maxConcurrency: number) {
    this.#maxConcurrency = maxConcurrency;
    this.#ensureGroupDispatcher('undefined');
  }

  registerThreadGroups(threadGroups: string[]): this {
    for (const threadGroup of threadGroups) {
      this.#ensureGroupDispatcher(threadGroup);
    }

    return this;
  }

  resolve(ph: 'B' | 'E' | 'i' | undefined, tid: number | ThreadAlias | undefined): number {
    if (typeof tid === 'number') {
      return tid;
    }

    const dispatcher = this.#resolveDispatcher(tid);
    const id = this.#resolveId(tid);

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

  #resolveDispatcher(threadAlias: ThreadAlias = 'undefined'): ThreadDispatcher {
    const groupName = typeof threadAlias === 'string' ? threadAlias : threadAlias[0];
    return this.#ensureGroupDispatcher(groupName);
  }

  #resolveId(threadAlias: ThreadAlias | undefined): unknown {
    return threadAlias === undefined || typeof threadAlias === 'string'
      ? undefined
      : threadAlias[1];
  }

  #ensureGroupDispatcher(threadGroup: string): ThreadDispatcher {
    if (!this.#dispatchers[threadGroup]) {
      const offset = this.#categoriesCount++ * this.#maxConcurrency;
      this.#dispatchers[threadGroup] = new ThreadDispatcher(threadGroup, offset);
    }

    return this.#dispatchers[threadGroup];
  }
}
