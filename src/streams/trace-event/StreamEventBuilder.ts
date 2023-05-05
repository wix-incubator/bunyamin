import type { Event } from 'trace-event-lib';
import { AbstractEventBuilder } from 'trace-event-lib';
import type { Transform } from 'node:stream';

export class StreamEventBuilder extends AbstractEventBuilder {
  constructor(protected readonly stream: Transform) {
    super();
  }

  send(event: Event) {
    this.stream.push(event);
  }
}
