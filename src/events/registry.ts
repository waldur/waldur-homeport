import { formatJsxTemplate, translate } from '@waldur/i18n';

import { EventGroup } from './types';

const modules = require.context('@waldur', true, /events\.tsx?$/);

export class EventRegistry {
  private groups = [];
  private formatters = {};
  private initialized = false;

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
    if (!this.initialized) {
      this.init();
    }
    const formatter = this.formatters[event.event_type];
    if (formatter) {
      return formatter(event.context) || event.message;
    } else {
      return event.message;
    }
  }

  getGroups() {
    if (!this.initialized) {
      this.init();
    }
    return this.groups;
  }

  init() {
    this.initialized = true;
    modules.keys().forEach(modules);
  }
}

const registry = new EventRegistry();

export default registry;
