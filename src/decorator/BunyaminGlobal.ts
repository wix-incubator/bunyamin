import type { Bunyamin } from './Bunyamin';
import type { BunyanLikeLogger } from './types';

export type BunyaminGlobal = Bunyamin<BunyanLikeLogger> & {
  setLogger: (logger: BunyanLikeLogger) => void;
};
