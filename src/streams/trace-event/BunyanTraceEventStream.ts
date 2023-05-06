import { Transform } from 'node:stream';

import { isError } from '../../utils';

import { ThreadGroupDispatcher } from './threads';
import type { ThreadGroupConfig } from './threads';
import { bunyan2trace } from './bunyan2trace';
import { StreamEventBuilder } from './StreamEventBuilder';
import type { TraceEventStreamOptions } from './TraceEventStreamOptions';

export class BunyanTraceEventStream extends Transform {
  readonly #knownTids = new Set<number>();
  readonly #threadGroupDispatcher: ThreadGroupDispatcher;
  readonly #builder = new StreamEventBuilder(this);
  readonly #ignoreFields: string[];
  readonly #defaultThreadName: string;

  #started = false;

  constructor(options: TraceEventStreamOptions = {}) {
    super({ objectMode: true });

    const maxConcurrency = options.maxConcurrency ?? 100;
    const threadGroups = (options.threadGroups ?? []).map((threadGroup) =>
      typeof threadGroup === 'string'
        ? {
            id: threadGroup,
            displayName: threadGroup,
          }
        : threadGroup,
    );

    if (maxConcurrency < 1) {
      throw new Error(`Invalid max concurrency (${maxConcurrency})`);
    }

    this.#ignoreFields = options.ignoreFields ?? ['v', 'hostname', 'level', 'name'];
    this.#defaultThreadName = options.defaultThreadName ?? 'Main Thread';
    this.#threadGroupDispatcher = new ThreadGroupDispatcher(options.strict ?? true, maxConcurrency);
    for (const [index, threadGroup] of threadGroups.entries()) {
      this.#validateThreadGroup(threadGroup, index);
      this.#threadGroupDispatcher.registerThreadGroup(threadGroup);
    }
  }

  _transform(
    record: unknown,
    _encoding: string,
    callback: (error?: Error | null, data?: unknown) => void,
  ) {
    const json = typeof record === 'string' ? JSON.parse(record) : record;
    const event = json && bunyan2trace(json);

    if (event.args) {
      for (const field of this.#ignoreFields) {
        delete event.args[field];
      }
    }

    if (!this.#started) {
      this.#started = true;
      this.#builder.metadata({
        pid: event.pid,
        ts: event.ts,
        name: 'process_name',
        args: { name: json.name },
      });
    }

    const tid = (event.tid = this.#threadGroupDispatcher.resolve(event.ph, event.tid));
    if (isError(tid)) {
      callback(tid);
      return;
    }

    if (!this.#knownTids.has(tid)) {
      this.#knownTids.add(tid);

      const threadName =
        tid === 0 ? this.#defaultThreadName : this.#threadGroupDispatcher.name(tid);

      if (threadName) {
        this.#builder.metadata({
          pid: event.pid,
          tid: event.tid,
          ts: event.ts,
          name: 'thread_name',
          args: { name: threadName },
        });
      }
    }

    this.#builder.send(event);
    callback(null);
  }

  #validateThreadGroup(threadGroup: ThreadGroupConfig, index: number) {
    if (!threadGroup.id) {
      throw new Error('Missing thread group ID in thread group at index ' + index);
    }

    if (threadGroup.maxConcurrency != null) {
      if (threadGroup.maxConcurrency < 1) {
        throw new Error(
          `Max concurrency (${threadGroup.id} -> ${threadGroup.maxConcurrency}) has to be a positive integer`,
        );
      }

      if (threadGroup.maxConcurrency > 100_500) {
        throw new Error(
          `Max concurrency (${threadGroup.id} -> ${threadGroup.maxConcurrency}) cannot be greater than 100,500`,
        );
      }
    }
  }
}
