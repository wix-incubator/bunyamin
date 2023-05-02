import type { EventPhase } from '../types';

export type LoggerContext = {
  [key: string]: unknown;

  ph?: EventPhase;
  cat?: string | string[];
  tid?: number;
};

export type ResolvedLoggerContext = Omit<LoggerContext, 'cat'> & {
  cat: string;
  tid: number;
};

export type UserLoggerContext = LoggerContext & {
  asyncId?: unknown;
};
