import { isUndefined } from '../utils';

export class ThreadDispatcher {
  private readonly stacks: number[] = [];
  private readonly threads: (string | number)[] = [];

  constructor(public readonly name: string) {}

  begin(id: string | number): number {
    const tid = this.#findTID(id);
    this.threads[tid] = id;
    this.stacks[tid] = (this.stacks[tid] || 0) + 1;
    return tid;
  }

  resolve(id: string | number): number {
    return this.#findTID(id);
  }

  end(id?: string | number): number {
    const tid = this.#findTID(id);
    if (this.stacks[tid] && --this.stacks[tid] === 0) {
      delete this.threads[tid];
    }
    return tid;
  }

  #findTID(id: string | number | undefined): number {
    let tid = id === undefined ? -1 : this.threads.indexOf(id);
    if (tid === -1) {
      // Try to find a recently released slot in the array:
      tid = this.threads.findIndex(isUndefined);
    }
    return tid === -1 ? this.threads.length : tid;
  }
}
