import IntervalTree from '@flatten-js/interval-tree';

import type { ThreadAlias, ThreadID } from '../../../types';
import { ThreadDispatcher } from './ThreadDispatcher';
import type { ThreadGroupConfig } from './ThreadGroupConfig';

export type ThreadGroupDispatcherConfig = {
  defaultThreadName: string;
  maxConcurrency: number;
  strict: boolean;
};

export class ThreadGroupDispatcher {
  readonly #strict: boolean;
  readonly #dispatchers: Record<string, ThreadDispatcher> = {};
  readonly #maxConcurrency: number;
  readonly #defaultThreadName: string;
  readonly #names: IntervalTree = new IntervalTree();

  #freeThreadId = 1;

  constructor(options: ThreadGroupDispatcherConfig) {
    this.#defaultThreadName = options.defaultThreadName;
    this.#maxConcurrency = options.maxConcurrency;
    this.#strict = options.strict;
  }

  registerThreadGroup(config: ThreadGroupConfig): this {
    const maxConcurrency = config.maxConcurrency ?? this.#maxConcurrency;
    const min = this.#freeThreadId;
    const max = min + maxConcurrency - 1;

    this.#dispatchers[config.id] = new ThreadDispatcher(config.displayName, this.#strict, min, max);
    this.#names.insert([min, max], config.displayName);
    this.#freeThreadId = max + 1;

    return this;
  }

  name(tid: number): string | undefined {
    if (tid === 0) {
      return this.#defaultThreadName;
    }

    return this.#names.search([tid, tid])[0];
  }

  resolve(ph: string | undefined, tid: ThreadID | undefined): number | Error {
    if (tid == null) {
      return 0;
    }

    if (typeof tid === 'number') {
      return tid;
    }

    const dispatcher = this.#resolveDispatcher(tid as ThreadAlias);
    if (!dispatcher) {
      return new Error(`Unknown thread group "${this.#resolveAlias(tid)}"`);
    }

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

  #resolveDispatcher(threadAlias: ThreadAlias): ThreadDispatcher {
    const groupName = typeof threadAlias === 'string' ? threadAlias : threadAlias[0];
    return this.#ensureGroupDispatcher(groupName);
  }

  #resolveAlias(threadAlias: ThreadAlias | undefined): unknown {
    return Array.isArray(threadAlias) ? threadAlias[0] : threadAlias;
  }

  #resolveId(threadAlias: ThreadAlias | undefined): unknown {
    return threadAlias === undefined || typeof threadAlias === 'string'
      ? undefined
      : threadAlias[1];
  }

  #ensureGroupDispatcher(threadGroup: string): ThreadDispatcher {
    if (!this.#dispatchers[threadGroup] && !this.#strict) {
      this.registerThreadGroup({ id: threadGroup, displayName: threadGroup });
    }

    return this.#dispatchers[threadGroup];
  }
}
