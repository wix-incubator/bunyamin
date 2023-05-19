import type { BunyaminConfig, BunyanLikeLogger } from './decorator';
import { Bunyamin } from './decorator';

export type * from './decorator';

export function wrapLogger<Logger extends BunyanLikeLogger>(
  options: BunyaminConfig<Logger>,
): Bunyamin<Logger> {
  return new Bunyamin(options);
}
