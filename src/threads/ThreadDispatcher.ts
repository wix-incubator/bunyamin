import { isUndefined } from '../utils';

export class ThreadDispatcher {
  readonly #stacks: number[] = [];
  readonly #threads: unknown[] = [];

  constructor(public readonly name: string, public readonly offset: number = 0) {}

  begin(id: unknown): number {
    const tid = this.#findTID(id);
    this.#threads[tid] = id;
    this.#stacks[tid] = (this.#stacks[tid] || 0) + 1;
    return this.offset + tid;
  }

  resolve(id: unknown): number {
    return this.offset + this.#findTID(id);
  }

  end(id: unknown): number {
    const tid = this.#findTID(id);
    if (this.#stacks[tid] && --this.#stacks[tid] === 0) {
      delete this.#threads[tid];
    }
    return this.offset + tid;
  }

  #findTID(id: unknown): number {
    let tid = id === undefined ? -1 : this.#threads.indexOf(id);
    if (tid === -1) {
      // Try to find a recently released slot in the array:
      tid = this.#threads.findIndex(isUndefined);
    }
    return tid === -1 ? this.#threads.length : tid;
  }
}
