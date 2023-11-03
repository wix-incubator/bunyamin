import type { BunyanLikeLogger } from './decorator';
import { Bunyamin } from './decorator';
import { noopLogger } from './noopLogger';

export * from './noopLogger';
export * from './traceEventStream';
export * from './uniteTraceEvents';
export * from './wrapLogger';
export * from './is-debug';

export default new Bunyamin<BunyanLikeLogger>({ logger: noopLogger() });
