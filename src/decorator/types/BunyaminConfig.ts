import type { BunyaminLogRecordFields } from './BunyaminLogRecordFields';
import type { BunyanLikeLogger } from './BunyanLikeLogger';

export type BunyaminConfig<Logger extends BunyanLikeLogger> = {
  /**
   * Underlying logger to be used.
   */
  logger: Logger;
  /**
   * Predefined categories for this logger. The order of categories affects thread sorting.
   */
  categories?: string[];
  /**
   * @default 'custom'
   */
  defaultCategory?: string;
  /**
   * Maximum number of thread IDs allocated to each main category.
   * @default 100
   */
  maxConcurrency?: number;
  transformFields?: <T extends BunyaminLogRecordFields>(context: T | undefined) => T | undefined;
};
