export type BunyaminLogRecordFields = {
  [customProperty: string]: unknown;

  /**
   * Event categories (tags) to facilitate filtering.
   * The first category is the main category.
   * Events within the same main category get attached to the same thread.
   * @default 'custom'
   * @example 'category1,category2'
   * @example ['category1', 'category2']
   */
  cat?: string | string[];
  /**
   * Hint for resolving Thread ID when there's a risk of logging several parallel duration events
   * within the same main category.
   */
  asyncId?: unknown;
  /**
   * Color name (applicable in Google Chrome Trace Format)
   */
  cname?: string;

  /**
   * @deprecated Cannot manually override Event Phase per Google Chrome Trace Format.
   */
  ph?: never;
  /**
   * Manual override for Process ID.
   * @deprecated Not recommended for use.
   */
  pid?: number;
  /**
   * Manual override for Thread ID.
   * @deprecated Not recommended for use.
   */
  tid?: number;
  /**
   * Manual override for timestamp.
   * The value should be either:
   * 1) in ISO 8601 Extended Format
   * 2) in UTC, as from Date.toISOString().
   * @deprecated Not recommended for use.
   * @example
   * '2020-01-01T00:00:00.000Z'
   */
  time?: string;
};
