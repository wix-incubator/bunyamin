import type { BunyaminConfig } from './decorator';
import { Bunyamin } from './decorator';
import { CategoryThreadDispatcher, MessageStack } from './threads';

export function createLogger(options: BunyaminConfig): Bunyamin {
  return new Bunyamin({
    ...options,

    dispatcher: new CategoryThreadDispatcher(),
    messageStack: new MessageStack(),
  });
}
