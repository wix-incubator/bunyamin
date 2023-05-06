import type { Transform } from 'node:stream';
import { jsonlWriteFile } from '../jsonl';
import type { TraceEventStreamOptions } from './TraceEventStreamOptions';
import { BunyanTraceEventStream } from './BunyanTraceEventStream';

export function traceEventStream(
  options: TraceEventStreamOptions & { filePath: string },
): Transform {
  const jsonl = jsonlWriteFile(options.filePath);
  const stream = new BunyanTraceEventStream(options);
  stream.pipe(jsonl);
  return stream;
}
