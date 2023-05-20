import { existsSync } from 'node:fs';
import { readFile, unlink } from 'node:fs/promises';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createLogger } from 'bunyan';
import tempy from 'tempy';
import type { Event } from 'trace-event-lib';
import type { Bunyamin } from '..';
import { traceEventStream, uniteTraceEventsToFile, wrapLogger } from '..';

describe('end-to-end', () => {
  let temporaryFilePaths: string[];

  beforeAll(() => {
    temporaryFilePaths = [];
  });

  afterAll(async () => {
    await Promise.all(
      temporaryFilePaths.map(async (filePath) => {
        if (filePath && existsSync(filePath)) {
          await unlink(filePath);
        }
      }),
    );
  });

  let server: Bunyamin;
  let client: Bunyamin;

  beforeAll(() => {
    const file1 = tempy.file();
    const file2 = tempy.file();
    temporaryFilePaths.push(file1, file2);

    server = wrapLogger({
      logger: createLogger({
        name: 'server',
        streams: [
          {
            level: 'trace',
            stream: traceEventStream({
              filePath: file1,
            }),
          },
        ],
      }),
    });

    client = wrapLogger({
      logger: createLogger({
        name: 'client',
        streams: [
          {
            level: 'trace',
            stream: traceEventStream({
              filePath: file2,
            }),
          },
        ],
      }),
    });
  });

  test('should log trace events', async () => {
    server.info({ port: 3000 }, 'Listening on port 3000');
    const router = server.child({ tid: 'router' });
    await client.debug.complete({ cookies: 'my-cookie' }, 'GET localhost:3000', async () => {
      await sleep(10);
      await router.debug.complete('GET /', async () => {
        await sleep(10);
        router.trace({ cookies: 'my-cookie' }, 'Parsing cookies');
      });
      await sleep(10);
      server.debug('Sending response');
      await sleep(10);
    });

    await sleep(100);

    const json1 = JSON.parse(await readFile(temporaryFilePaths[0], 'utf8')) as Event[];
    const json2 = JSON.parse(await readFile(temporaryFilePaths[1], 'utf8')) as Event[];

    json1.forEach((record, index) => {
      record.pid = 100;
      record.ts = index;
    });

    json2.forEach((record, index) => {
      record.pid = 200;
      record.ts = index;
    });

    expect(json1).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "name": "server",
          },
          "name": "process_name",
          "ph": "M",
          "pid": 100,
          "tid": 0,
          "ts": 0,
        },
        {
          "args": {
            "name": "Main Thread",
          },
          "name": "thread_name",
          "ph": "M",
          "pid": 100,
          "tid": 0,
          "ts": 1,
        },
        {
          "args": {
            "port": 3000,
          },
          "name": "Listening on port 3000",
          "ph": "i",
          "pid": 100,
          "tid": 0,
          "ts": 2,
        },
        {
          "args": {
            "name": "router",
          },
          "name": "thread_name",
          "ph": "M",
          "pid": 100,
          "tid": 1,
          "ts": 3,
        },
        {
          "args": {},
          "name": "GET /",
          "ph": "B",
          "pid": 100,
          "tid": 1,
          "ts": 4,
        },
        {
          "args": {
            "cookies": "my-cookie",
          },
          "name": "Parsing cookies",
          "ph": "i",
          "pid": 100,
          "tid": 1,
          "ts": 5,
        },
        {
          "args": {
            "success": true,
          },
          "ph": "E",
          "pid": 100,
          "tid": 1,
          "ts": 6,
        },
        {
          "args": {},
          "name": "Sending response",
          "ph": "i",
          "pid": 100,
          "tid": 0,
          "ts": 7,
        },
      ]
    `);

    expect(json2).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "name": "client",
          },
          "name": "process_name",
          "ph": "M",
          "pid": 200,
          "tid": 0,
          "ts": 0,
        },
        {
          "args": {
            "name": "Main Thread",
          },
          "name": "thread_name",
          "ph": "M",
          "pid": 200,
          "tid": 0,
          "ts": 1,
        },
        {
          "args": {
            "cookies": "my-cookie",
          },
          "name": "GET localhost:3000",
          "ph": "B",
          "pid": 200,
          "tid": 0,
          "ts": 2,
        },
        {
          "args": {
            "success": true,
          },
          "ph": "E",
          "pid": 200,
          "tid": 0,
          "ts": 3,
        },
      ]
    `);
  });

  // TODO: write a test which will fail on the default highWaterMark

  test('should unite trace events', async () => {
    const file3 = tempy.file();

    await uniteTraceEventsToFile(temporaryFilePaths, file3, {
      mode: 'fpid',
    });

    temporaryFilePaths.push(file3);

    const json3 = JSON.parse(await readFile(file3, 'utf8')) as Event[];
    json3.forEach((record, index) => {
      record.ts = index;
    });

    expect(json3).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "name": "server",
          },
          "name": "process_name",
          "ph": "M",
          "pid": 1,
          "tid": 0,
          "ts": 0,
        },
        {
          "args": {
            "name": "Main Thread",
          },
          "name": "thread_name",
          "ph": "M",
          "pid": 1,
          "tid": 0,
          "ts": 1,
        },
        {
          "args": {
            "port": 3000,
          },
          "name": "Listening on port 3000",
          "ph": "i",
          "pid": 1,
          "tid": 0,
          "ts": 2,
        },
        {
          "args": {
            "name": "client",
          },
          "name": "process_name",
          "ph": "M",
          "pid": 2,
          "tid": 2,
          "ts": 3,
        },
        {
          "args": {
            "name": "Main Thread",
          },
          "name": "thread_name",
          "ph": "M",
          "pid": 2,
          "tid": 2,
          "ts": 4,
        },
        {
          "args": {
            "cookies": "my-cookie",
          },
          "name": "GET localhost:3000",
          "ph": "B",
          "pid": 2,
          "tid": 2,
          "ts": 5,
        },
        {
          "args": {
            "name": "router",
          },
          "name": "thread_name",
          "ph": "M",
          "pid": 1,
          "tid": 1,
          "ts": 6,
        },
        {
          "args": {},
          "name": "GET /",
          "ph": "B",
          "pid": 1,
          "tid": 1,
          "ts": 7,
        },
        {
          "args": {
            "cookies": "my-cookie",
          },
          "name": "Parsing cookies",
          "ph": "i",
          "pid": 1,
          "tid": 1,
          "ts": 8,
        },
        {
          "args": {
            "success": true,
          },
          "ph": "E",
          "pid": 1,
          "tid": 1,
          "ts": 9,
        },
        {
          "args": {},
          "name": "Sending response",
          "ph": "i",
          "pid": 1,
          "tid": 0,
          "ts": 10,
        },
        {
          "args": {
            "success": true,
          },
          "ph": "E",
          "pid": 2,
          "tid": 2,
          "ts": 11,
        },
      ]
    `);
  });
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
