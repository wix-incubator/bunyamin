export type BunyanReservedProperty = 'hostname' | 'level' | 'msg' | 'name' | 'pid' | 'time';

export type EmergencyLogFunction = (error: unknown | null, message: string) => void;

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export type EventPhase = 'B' | 'E' | 'i';

export type TraceEventContext = {
  cat?: string | string[];
  ph?: EventPhase;
  pid: number;
  tid: number;
  ts: number;
};

export type UserTraceEventContext = TraceEventContext & {
  asyncId?: unknown;
};
