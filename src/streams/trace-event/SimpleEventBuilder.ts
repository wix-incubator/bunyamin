import type { Event } from 'trace-event-lib';
import { AbstractEventBuilder } from 'trace-event-lib';

export class SimpleEventBuilder extends AbstractEventBuilder {
  public readonly events: Event[] = [];

  send(event: Event) {
    this.events.push(event);
  }
}
