import type { BunyanLikeLogger } from './decorator';
import { Bunyamin } from './decorator';
import { noopLogger } from './noopLogger';

type Realm = {
  bunyamin: Bunyamin<BunyanLikeLogger>;
  nobunyamin: Bunyamin<BunyanLikeLogger>;
};

function create() {
  const threadGroups: any[] = [];
  const bunyamin = new Bunyamin<BunyanLikeLogger>({ logger: noopLogger(), threadGroups });
  const nobunyamin = new Bunyamin<BunyanLikeLogger>({
    logger: noopLogger(),
    threadGroups,
    immutable: true,
  });

  return { bunyamin, nobunyamin };
}

function getCached(): Realm | undefined {
  return (globalThis as any).__BUNYAMIN__;
}

function setCached(realm: Realm) {
  (globalThis as any).__BUNYAMIN__ = realm;
  return realm;
}

export default setCached(getCached() ?? create());
