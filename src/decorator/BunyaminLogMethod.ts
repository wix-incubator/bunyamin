import { LoggerContext } from './LoggerContext';

export interface BunyaminLogMethod {
  (message: string, context?: LoggerContext): void;
  (error: Error, message?: string, context?: LoggerContext): void;
  begin(message: string, context?: LoggerContext): void;
  end(context?: LoggerContext): void;
  end(message: string, context?: LoggerContext): void;
  complete(message: string, context?: LoggerContext): void;
}
