import type { BunyaminLogRecordFields } from './BunyaminLogRecordFields';
import type { BunyanLikeLogger } from './BunyanLikeLogger';

export type BunyaminConfig<Logger extends BunyanLikeLogger> = {
  /**
   * Underlying logger to be used.
   */
  logger: Logger;
  /**
   * Predefined order of thread aliases.
   * Cosmetic feature to help resolving thread IDs in a desired order.
   */
  threads?: string[];
  /**
   * Maximum number of thread IDs allocated to each thread alias.
   * @default 100
   */
  maxConcurrency?: number;
  /**
   * Optional transformation of log record fields provided by the user.
   */
  transformFields?: <T extends BunyaminLogRecordFields>(context: T | undefined) => T | undefined;
};
