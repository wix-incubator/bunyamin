import { getMainCategory } from '../../categories';

export class ThreadResolver {
  static readonly ERROR_TID = 37_707;

  #globalThreadMap?: Map<string, number>;

  async scanThreadIDs(eventStream: NodeJS.ReadableStream) {
    const processes = await new Promise<Record<string, Record<string, number[]>>>(
      (resolve, reject) => {
        const result: Record<string, Record<string, number[]>> = {};

        eventStream
          .on('end', () => resolve(result))
          .on('error', /* istanbul ignore next */ (error) => reject(error))
          .on('data', (event) => {
            const { ph, pid, tid, cat } = event;
            if (ph === 'B' || ph === 'i') {
              const categories = (result[pid] = result[pid] || {});
              const mainCategory = String(cat).split(',')[0];
              const tids = (categories[mainCategory] = categories[mainCategory] || []);
              if (!tids.includes(tid)) {
                tids.push(tid);
              }
            }
          });
      },
    );

    const tidArray = Object.entries(processes).flatMap(([pid, categories]) => {
      return Object.entries(categories).flatMap(([category, tids]) => {
        return tids.map((tid) => `${pid}:${category}:${tid}`);
      });
    });

    this.#globalThreadMap = new Map(tidArray.map((hash, index) => [hash, index]));
  }

  resolveGlobalTID(event: any): number {
    const hash = this._computeThreadHash(event);
    const tid = this.#globalThreadMap ? this.#globalThreadMap.get(hash) : event.tid;

    // Impossible condition, but anyway it is better to be safe than sorry.
    /* istanbul ignore next */
    return tid === undefined ? ThreadResolver.ERROR_TID : tid;
  }

  _computeThreadHash({ pid, tid, cat }: any): string {
    return `${pid}:${getMainCategory(cat)}:${tid}`;
  }
}
