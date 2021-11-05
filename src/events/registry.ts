import { formatJsxTemplate, translate } from '@waldur/i18n';

import { EventGroup } from './types';

export class EventRegistry {
  private groups = [];
  private formatters = {};

  registerGroup(group: EventGroup) {
    this.groups.push(group);
    for (const type of group.events) {
      const defaultFormatter = (event) => {
        let context = event;
        if (group.context) {
          context = { ...context, ...group.context(event) };
        }
        return translate(type.title, context, formatJsxTemplate);
      };
      this.formatters[type.key] = type.formatter || defaultFormatter;
    }
  }

  formatEvent(event) {
    const formatter = this.formatters[event.event_type];
    if (formatter) {
      return formatter(event.context) || event.message;
    } else {
      return event.message;
    }
  }

  getGroups() {
    return this.groups;
  }
}

const registry = new EventRegistry();

const modules = require.context('@waldur', true, /events\.tsx?$/);
modules.keys().forEach(modules);

export default registry;
