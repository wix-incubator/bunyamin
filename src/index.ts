import type { BunyanLikeLogger } from './decorator';
import { Bunyamin } from './decorator';
import { noopLogger } from './noopLogger';

export * from './noopLogger';
export * from './traceEventStream';
export * from './uniteTraceEvents';
export * from './wrapLogger';
export * from './is-debug';

const threadGroups: any[] = [];
export const bunyamin = new Bunyamin<BunyanLikeLogger>({ logger: noopLogger(), threadGroups });
export const nobunyamin = new Bunyamin<BunyanLikeLogger>({
  logger: noopLogger(),
  threadGroups,
  immutable: true,
});

export default bunyamin;
