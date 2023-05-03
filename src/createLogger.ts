import type { LoggerOptions } from 'bunyan';
import { createLogger as createBunyanLogger } from 'bunyan';
import { Bunyamin } from './decorator';

export function createLogger(options: LoggerOptions) {
  return new Bunyamin({
    logger: createBunyanLogger(options),
  });
}
