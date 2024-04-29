/* eslint-disable @typescript-eslint/consistent-type-imports */
import { beforeEach, describe, expect, jest, it } from '@jest/globals';
import type { ThreadGroups } from './ThreadGroups';
import { wrapLogger } from '../wrapLogger';
import type { Bunyamin } from '../decorator';

describe('ThreadGroups', () => {
  let ThreadGroups: typeof import('./ThreadGroups').ThreadGroups;
  let threadGroups: ThreadGroups;
  let isDebug: jest.Mocked<any>;
  let logger: Bunyamin;

  beforeEach(() => {
    jest.mock('../is-debug');
    isDebug = jest.requireMock<any>('../is-debug');
    ThreadGroups = jest.requireActual<any>('./ThreadGroups').ThreadGroups;
    logger = wrapLogger({
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
    });
  });

  describe('in regular mode', () => {
    beforeEach(() => {
      isDebug.isSelfDebug.mockReturnValue(false);
      threadGroups = new ThreadGroups(() => logger);
    });

    it('should be empty by default', () => {
      expect([...threadGroups]).toEqual([]);
    });

    it('should add a thread group', () => {
      const group = { id: 'foo', displayName: 'Foo' };
      threadGroups.add(group);
      expect([...threadGroups]).toEqual([group]);
    });

    it('should not call logger.trace', () => {
      expect(logger.logger.trace).not.toHaveBeenCalled();
    });
  });

  describe('in debug mode', () => {
    beforeEach(() => {
      isDebug.isSelfDebug.mockReturnValue(true);
      threadGroups = new ThreadGroups(() => logger);
    });

    it('should call logger.trace upon addition', () => {
      const group = { id: 'foo', displayName: 'Foo' };
      threadGroups.add(group);
      expect(logger.logger.trace).toHaveBeenCalledWith(
        { cat: 'bunyamin' },
        expect.stringContaining(__filename),
      );
    });
  });
});
