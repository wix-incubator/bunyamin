import type { BunyanLikeLogger } from '../decorator';

const noop: any = () => {
  /* no-op */
};

export function noopLogger(_options?: any): BunyanLikeLogger {
  return {
    fatal: noop,
    error: noop,
    warn: noop,
    info: noop,
    debug: noop,
    trace: noop,
  };
}
