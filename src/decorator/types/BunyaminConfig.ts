import type { BunyaminLogRecordFields } from './BunyaminLogRecordFields';
import type { BunyanLikeLogger } from './BunyanLikeLogger';

export type BunyaminConfig<Logger extends BunyanLikeLogger> = {
  /**
   * Underlying logger to be used.
   */
  logger: Logger;
  /**
   * Fallback message to be used when there was no previous message
   * passed with {@link BunyaminLogMethod#begin}.
   * @default '<no begin message>'
   */
  noBeginMessage?: string | unknown;
  /**
   * Optional transformation of log record fields provided by the user.
   */
  transformFields?: <T extends BunyaminLogRecordFields>(context: T | undefined) => T | undefined;
};
