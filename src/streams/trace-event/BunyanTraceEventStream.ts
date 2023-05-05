import { Transform } from 'stream';
import { ThreadGroupDispatcher } from '../../threads';
import type { ThreadGroupConfig } from '../../threads';
import { StreamEventBuilder } from './StreamEventBuilder';
import { buildTraceEvent } from './buildTraceEvent';

export type BunyanTraceEventStreamOptions = {
  /**
   * @default ['v', 'hostname', 'level', 'name']
   */
  ignoreFields?: string[];
  /**
   * Thread groups allow you to use non-numeric thread IDs (aliases) in your
   * logs. This is useful when you have multiple asynchronous operations
   * running in parallel, and you want to group them together in the trace
   * viewer under the same thread name and keep the thread IDs together.
   */
  threadGroups?: (string | ThreadGroupConfig)[];
  /**
   * Default maximum number of concurrent threads in each thread group.
   * Must be a positive integer.
   * @default 100
   */
  maxConcurrency?: number;
  /**
   * Strict mode. If enabled, throws an error when a thread group ID (alias)
   * is out of available thread IDs (see `maxConcurrency`). Otherwise, the
   * thread ID is resolved to the maximum available thread ID.
   */
  strict?: boolean;
};

export class BunyanTraceEventStream extends Transform {
  readonly #knownTids = new Set<number>();
  readonly #threadGroupDispatcher: ThreadGroupDispatcher;
  readonly #builder = new StreamEventBuilder(this);
  readonly #ignoreFields: string[];

  #started = false;

  constructor(options: BunyanTraceEventStreamOptions = {}) {
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
    this.#threadGroupDispatcher = new ThreadGroupDispatcher(options.strict ?? true, maxConcurrency);
    for (const [index, threadGroup] of threadGroups.entries()) {
      this.#validateThreadGroup(threadGroup, index);
      this.#threadGroupDispatcher.registerThreadGroup(threadGroup);
    }
  }

  _transform(record: any, _encoding: string, callback: (error?: Error | null, data?: any) => void) {
    const json = typeof record === 'string' ? JSON.parse(record) : record;
    const event = buildTraceEvent(json);

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

    // TODO: validate non-begin/end events
    const tid = (event.tid = this.#threadGroupDispatcher.resolve(event.ph, event.tid));

    if (!this.#knownTids.has(tid)) {
      this.#knownTids.add(tid);

      const threadName = this.#threadGroupDispatcher.name(tid);

      if (threadName) {
        this.#builder.metadata({
          pid: event.pid,
          tid: event.tid,
          ts: event.ts,
          name: 'thread_name',
          args: { name: this.#threadGroupDispatcher.name(event.tid) },
        });
      }
    }

    this.push(event);
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
