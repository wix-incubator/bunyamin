import { Transform } from 'node:stream';
import type { TraceEvent } from 'trace-event-lib';
import type { Resolver } from '../resolvers';
import type { JSONLEntry } from '../../jsonl';

export class TraceAnalyze extends Transform {
  readonly #resolver: Resolver;

  constructor(resolver: Resolver) {
    super({ objectMode: true });
    this.#resolver = resolver;
  }

  _transform(
    chunk: unknown,
    _encoding: string,
    callback: (error?: Error | null, data?: unknown) => void,
  ) {
    const entry = chunk as JSONLEntry<TraceEvent>;
    this.#resolver.add(entry.value.pid, entry.filePath, entry.value.tid);
    callback();
  }

  _final(callback: (error?: Error | null) => void) {
    this.#resolver.finalize();
    callback();
  }
}
