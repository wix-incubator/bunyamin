import { Bunyamin } from './decorator';
import { noopLogger } from './noopLogger';
import { isSelfDebug } from './is-debug';
import { ThreadGroups } from './thread-groups';

type Realm = {
  bunyamin: Bunyamin;
  nobunyamin: Bunyamin;
  threadGroups: ThreadGroups;
};

function create() {
  const selfDebug = isSelfDebug();
  const bunyamin = new Bunyamin({ logger: noopLogger() });
  const nobunyamin = new Bunyamin({
    logger: noopLogger(),
    immutable: true,
  });
  const threadGroups = new ThreadGroups(bunyamin);

  if (selfDebug) {
    bunyamin.trace({ cat: 'bunyamin' }, 'bunyamin global instance created');
  }

  return { bunyamin, nobunyamin, threadGroups };
}

function getCached(): Realm | undefined {
  const result = (globalThis as any).__BUNYAMIN__;

  if (isSelfDebug() && result) {
    result.bunyamin.trace({ cat: 'bunyamin' }, 'bunyamin global instance retrieved from cache');
  }

  return result;
}

function setCached(realm: Realm) {
  (globalThis as any).__BUNYAMIN__ = realm;
  return realm;
}

export default setCached(getCached() ?? create());
