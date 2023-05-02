import type { LoggerContext } from './LoggerContext';

export interface BunyaminLogMethod {
  (message: string, context?: LoggerContext): void;
  (error: Error, message?: string, context?: LoggerContext): void;
  begin(message: string, context?: LoggerContext): void;
  end(context?: LoggerContext): void;
  end(message: string, context?: LoggerContext): void;
  complete(message: string, action: unknown): void;
  complete(context: LoggerContext, message: string, action: unknown): void;
}
