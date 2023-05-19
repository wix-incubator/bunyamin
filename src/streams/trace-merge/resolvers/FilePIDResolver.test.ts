import { beforeAll, describe, expect, test } from '@jest/globals';
import { FilePIDResolver } from './FilePIDResolver';

describe('FilePIDResolver', () => {
  let resolver: FilePIDResolver;

  beforeAll(() => {
    resolver = new FilePIDResolver();
    for (const [pid, filePath, tid] of testValues()) {
      resolver.add(pid, filePath, tid);
    }
    resolver.finalize();
  });

  test.each(testPIDs())('resolvePid(%s, %s, %s) = %s', (pid, filePath, _tid, expected) => {
    expect(resolver.resolvePid(filePath, pid)).toBe(expected);
  });

  test.each(testTIDs())('resolveTid(%s, %s, %s) = %s', (pid, filePath, tid, expected) => {
    expect(resolver.resolveTid(filePath, pid, tid)).toBe(expected);
  });
});

function testValues(): [number, string, number, number, number][] {
  return [
    [2001, 'file1', 100, 1, 0],
    [2002, 'file1', 100, 3, 4],
    [2001, 'file1', 101, 1, 1],
    [2002, 'file1', 101, 3, 5],
    [2001, 'file2', 100, 2, 2],
    [2002, 'file2', 100, 4, 6],
    [2001, 'file2', 101, 2, 3],
    [2002, 'file2', 101, 4, 7],
  ];
}

function testPIDs(): [number, string, number, number][] {
  return testValues().map(([pid, filePath, tid, expectedPid, _expectedTid]) => [
    pid,
    filePath,
    tid,
    expectedPid,
  ]);
}

function testTIDs(): [number, string, number, number][] {
  return testValues().map(([pid, filePath, tid, _expectedPid, expectedTid]) => [
    pid,
    filePath,
    tid,
    expectedTid,
  ]);
}
