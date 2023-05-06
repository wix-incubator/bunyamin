import type { LoggerOptions } from 'bunyan';
import bunyan from 'bunyan';
import { Bunyamin } from './decorator';

export function createLogger(options: LoggerOptions) {
  return new Bunyamin({
    logger: bunyan.createLogger(options),
  });
}
