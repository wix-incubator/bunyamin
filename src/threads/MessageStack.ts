export class MessageStack {
  private _map: Record<string, unknown[]> = {};

  push({ tid }: AsyncContext, message: unknown) {
    if (this._map[tid] == undefined) {
      this._map[tid] = [];
    }

    return this._map[tid].push(message);
  }

  pop({ tid }: AsyncContext) {
    const stack = this._map[tid];
    if (stack == undefined || stack.length === 0) {
      return ['<no begin message>'];
    }

    return stack.pop() as unknown[];
  }
}

export type AsyncContext = {
  tid: number;
};
