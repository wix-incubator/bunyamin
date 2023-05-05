import { jsonlWriteFile } from '../jsonl';
import type { BunyanTraceEventStreamOptions } from './BunyanTraceEventStream';
import { BunyanTraceEventStream } from './BunyanTraceEventStream';

export function traceEventStream(options: BunyanTraceEventStreamOptions & { filePath: string }) {
  const jsonl = jsonlWriteFile(options.filePath);
  const stream = new BunyanTraceEventStream(options);
  stream.pipe(jsonl);
  return stream;
}
