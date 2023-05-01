export type BunyanReservedProperty = 'hostname' | 'level' | 'msg' | 'name' | 'pid' | 'time';

export type EmergencyLogFunction = (error: unknown | null, message: string) => void;

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export type TraceEventContext = {
  cat?: string | string[];
  ph?: 'B' | 'E' | 'i';
  pid: number;
  tid: number;
  ts: number;
};
