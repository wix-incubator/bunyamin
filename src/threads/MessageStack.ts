import { getMainCategory } from './getMainCategory';
import { TraceEventContext } from '../types';

export class MessageStack {
  private _map: Record<string, unknown[]> = {};

  push(context: TraceEventContext, message: unknown) {
    const hash = this.#hash(context);

    if (this._map[hash] == undefined) {
      this._map[hash] = [];
    }

    return this._map[hash].push(message);
  }

  pop(context: TraceEventContext) {
    const hash = this.#hash(context);
    const stack = this._map[hash];
    if (stack == undefined || stack.length === 0) {
      return ['<no begin message>'];
    }

    return stack.pop();
  }

  #hash(context: TraceEventContext): string {
    const cat = getMainCategory(context.cat);
    const tid = context.tid;
    return `${cat}:${tid}`;
  }
}
