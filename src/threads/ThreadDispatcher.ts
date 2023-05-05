import { isUndefined } from '../utils';

export class ThreadDispatcher {
  readonly #stacks: number[] = [];
  readonly #threads: unknown[] = [];

  constructor(
    public readonly name: string,
    public readonly strict: boolean,
    public readonly min: number,
    public readonly max: number,
  ) {}

  begin(id: unknown): number {
    const tid = this.#findTID(id);
    this.#threads[tid] = id;
    this.#stacks[tid] = (this.#stacks[tid] || 0) + 1;

    return this.#transposeTID(tid);
  }

  resolve(id: unknown): number {
    return this.#transposeTID(this.#findTID(id));
  }

  end(id: unknown): number {
    const tid = this.#findTID(id);
    if (this.#stacks[tid] && --this.#stacks[tid] === 0) {
      delete this.#threads[tid];
    }

    return this.#transposeTID(tid);
  }

  #findTID(id: unknown): number {
    let tid = id === undefined ? -1 : this.#threads.indexOf(id);
    if (tid === -1) {
      // Try to find a recently released slot in the array:
      tid = this.#threads.findIndex(isUndefined);
    }
    return tid === -1 ? this.#threads.length : tid;
  }

  #transposeTID(tid: number): number {
    const result = this.min + tid;
    if (result > this.max) {
      if (this.strict) {
        throw new Error(`Exceeded limit ${this.max} of concurrent threads in group "${this.name}"`);
      } else {
        return this.max;
      }
    }

    return result;
  }
}
