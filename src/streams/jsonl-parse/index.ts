import JsonlParser from 'stream-json/jsonl/Parser';

import { EmergencyLogFunction as LogFunction } from '../../types';
import { through } from '../through';

export function parseJSONL(log: LogFunction) {
  const readable = through();
  const writable = JsonlParser.make({ checkErrors: true }).on('error', (error: any) => {
    /* istanbul ignore else */
    if (error instanceof SyntaxError) {
      log(error, 'Failed to parse log line');
      readable.end();
    } else {
      readable.emit('error', error);
    }
  });

  return {
    writable,
    readable: writable.pipe(readable),
  };
}
