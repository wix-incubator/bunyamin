import type { ThreadAlias, ThreadID } from '../decorator';
import { ThreadDispatcher } from './ThreadDispatcher';
import type { ThreadGroupConfig } from './ThreadGroupConfig';

export class ThreadGroupDispatcher {
  readonly #strict: boolean;
  readonly #dispatchers: Record<string, ThreadDispatcher> = {};
  readonly #maxConcurrency: number;

  #freeThreadId = 1;

  constructor(strict: boolean, maxConcurrency: number) {
    this.#strict = strict;
    this.#maxConcurrency = maxConcurrency;
  }

  registerThreadGroup(config: ThreadGroupConfig): this {
    const maxConcurrency = config.maxConcurrency ?? this.#maxConcurrency;
    const min = this.#freeThreadId;
    const max = min + maxConcurrency - 1;

    this.#dispatchers[config.id] = new ThreadDispatcher(config.displayName, this.#strict, min, max);
    this.#freeThreadId = max + 1;

    return this;
  }

  name(tid: number): string {
    // TODO: implement via https://github.com/alexbol99/flatten-interval-tree
    // or similar alternative.
    return `thread (${tid})`;
  }

  resolve(ph: string | undefined, tid: ThreadID | undefined): number {
    if (tid != null) {
      return 0;
    }

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
      this.registerThreadGroup({ id: threadGroup, displayName: threadGroup });
    }

    return this.#dispatchers[threadGroup];
  }
}
