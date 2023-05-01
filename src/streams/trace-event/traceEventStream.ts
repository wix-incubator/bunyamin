import { getMainCategory } from '../../threads';
import { flatMapTransform } from '../flatMapTransform';
import { ThreadResolver } from './ThreadResolver';
import { SimpleEventBuilder } from './SimpleEventBuilder';

export function traceEventStream(threadResolver = new ThreadResolver()) {
  const context: TransformerContext = {
    threadResolver,
    primaryPid: Number.NaN,
    knownPids: new Set(),
    knownTids: new Set(),
  };

  return flatMapTransform(transformBunyanRecord.bind(context));
}

type TransformerContext = {
  knownPids: Set<number>;
  knownTids: Set<number>;
  primaryPid: number;
  threadResolver: ThreadResolver;
};

function transformBunyanRecord(this: TransformerContext, bunyanLogRecord: any) {
  const {
    cat: rawCat,
    msg: name,
    ph,
    pid,
    tid: _tid,
    time,
    name: _name,
    hostname: _hostname,
    ...arguments_
  } = bunyanLogRecord;
  const ts = new Date(time).getTime() * 1e3;
  const cat = rawCat || 'undefined';
  const tid = this.threadResolver.resolveGlobalTID(bunyanLogRecord);

  const builder = new SimpleEventBuilder();
  if (!this.knownPids.has(pid)) {
    if (Number.isNaN(this.primaryPid)) {
      this.primaryPid = pid;
    }

    builder.metadata({
      pid,
      ts,
      name: 'process_name',
      args: { name: pid === this.primaryPid ? 'primary' : 'secondary' },
    });
    builder.metadata({
      pid,
      ts,
      name: 'process_sort_index',
      args: { sort_index: this.knownPids.size },
    });
    this.knownPids.add(pid);
  }

  if (!this.knownTids.has(tid)) {
    const mainCategory = getMainCategory(cat);
    builder.metadata({ pid, tid, ts, name: 'thread_name', args: { name: mainCategory } });
    builder.metadata({ pid, tid, ts, name: 'thread_sort_index', args: { sort_index: tid } });
    this.knownTids.add(tid);
  }

  const event = { ph, name, pid, tid, cat, ts, args: arguments_ };
  if (ph === 'E') {
    delete event.name;
  }

  builder.events.push(event);
  return builder.events;
}
