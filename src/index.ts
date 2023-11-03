import { Bunyamin } from './decorator';
import { noopLogger } from './noopLogger';

export * from './noopLogger';
export * from './traceEventStream';
export * from './uniteTraceEvents';
export * from './wrapLogger';

export default new Bunyamin({ logger: noopLogger() });
