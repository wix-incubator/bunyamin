import { flatMapTransform } from '../flatMapTransform';
import { SimpleEventBuilder } from './SimpleEventBuilder';

export function traceEventStream() {
  const context: TransformerContext = {
    knownPids: new Set(),
    knownTids: new Set(),
  };

  return flatMapTransform(transformBunyanRecord.bind(context));
}

type TransformerContext = {
  knownPids: Set<number>;
  knownTids: Set<number>;
};

function transformBunyanRecord(this: TransformerContext, bunyanLogRecord: any) {
  const {
    cat,
    msg: name,
    ph,
    pid,
    tid = 0,
    time,
    name: processName,
    hostname: _hostname,
    ...otherArguments
  } = JSON.parse(bunyanLogRecord);
  const ts = new Date(time).getTime() * 1e3;

  const builder = new SimpleEventBuilder();
  if (!this.knownPids.has(pid)) {
    if (processName) {
      builder.metadata({
        pid,
        ts,
        name: 'process_name',
        args: { name: processName },
      });
    }

    builder.metadata({
      pid,
      ts,
      name: 'process_sort_index',
      args: { sort_index: this.knownPids.size },
    });

    this.knownPids.add(pid);
  }

  if (!this.knownTids.has(tid)) {
    // builder.metadata({ pid, tid, ts, name: 'thread_name', args: { name: mainCategory } });
    builder.metadata({ pid, tid, ts, name: 'thread_sort_index', args: { sort_index: tid } });
    this.knownTids.add(tid);
  }

  const event = { ph, name, pid, tid, cat, ts, args: otherArguments };
  if (ph === 'E') {
    delete event.name;
  }

  builder.events.push(event);
  return builder.events;
}
