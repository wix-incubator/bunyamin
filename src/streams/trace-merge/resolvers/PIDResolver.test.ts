import { beforeAll, describe, expect, test } from '@jest/globals';
import { PIDResolver } from './PIDResolver';

describe('PIDResolver', () => {
  let resolver: PIDResolver;

  beforeAll(() => {
    resolver = new PIDResolver();
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
    [2001, 'file1', 100, 2001, 0],
    [2002, 'file1', 100, 2002, 2],
    [2001, 'file1', 101, 2001, 1],
    [2002, 'file1', 101, 2002, 3],
    [2001, 'file2', 100, 2001, 0],
    [2002, 'file2', 100, 2002, 2],
    [2001, 'file2', 101, 2001, 1],
    [2002, 'file2', 101, 2002, 3],
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
