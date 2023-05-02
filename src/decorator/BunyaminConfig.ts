import type { LoggerContext } from './LoggerContext';

export type BunyaminConfig = {
  logger?: any; // BunyanLogger;
  /**
   * Predefined categories for this logger. The order of categories affects thread sorting.
   */
  categories?: string[];
  /**
   * @default 'custom'
   */
  defaultCategory?: string;
  /**
   * @default 100
   */
  maxConcurrency?: number;
  transformContext?: <T extends LoggerContext>(context: T | undefined) => T | undefined;
};
