import type { Bunyamin } from '../decorator';
import type { ThreadGroupConfig } from '../streams';
import { isSelfDebug } from '../is-debug';
import { StackTraceError } from '../decorator/StackTraceError';

export class ThreadGroups {
  readonly #bunyamin: Bunyamin;
  readonly #debugMode = isSelfDebug();
  readonly #groups = new Map<string, ThreadGroupConfig>();

  constructor(bunyamin: Bunyamin) {
    this.#bunyamin = bunyamin;
    this.#groups = new Map();
  }

  add(group: ThreadGroupConfig) {
    if (this.#debugMode) {
      if (this.#groups.has(group.id)) {
        this.#logAddition(group, 'overwritten');
      } else {
        this.#logAddition(group, 'added');
      }
    }

    this.#groups.set(group.id, group);
    return this;
  }

  [Symbol.iterator]() {
    return this.#groups.values();
  }

  #logAddition(group: ThreadGroupConfig, action: string) {
    const { stack } = new StackTraceError();
    this.#bunyamin.trace(
      { cat: 'bunyamin' },
      `thread group ${action}: ${group.id} (${group.displayName})\n\n${stack}`,
    );
  }
}
