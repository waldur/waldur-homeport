import { translate } from '@waldur/i18n';

import { EventGroup } from './types';

export class EventRegistry {
  private groups = [];
  private formatters = {};

  registerGroup(group: EventGroup) {
    this.groups.push(group);
    for (const type of group.events) {
      const defaultFormatter = event => {
        let context = event;
        if (group.context) {
          context = { ...context, ...group.context(event) };
        }
        return translate(type.title, context);
      };
      this.formatters[type.key] = type.formatter || defaultFormatter;
    }
  }

  formatEvent(event) {
    const formatter = this.formatters[event.event_type];
    if (formatter) {
      return formatter(event.context);
    } else {
      return event.message;
    }
  }

  getGroups() {
    return this.groups;
  }
}

const registry = new EventRegistry();

export default registry;
