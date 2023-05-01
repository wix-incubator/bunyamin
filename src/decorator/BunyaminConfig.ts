export type BunyaminConfig = {
  bunyan?: any; // BunyanLogger;
  /**
   * Disables sanitization of user input, used for integration tests.
   */
  unsafeMode?: boolean;
};
