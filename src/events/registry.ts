import { AuthEvents } from '@waldur/auth/AuthEvents';
import { OrganizationEvents } from '@waldur/customer/events';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { InvoiceEvents } from '@waldur/invoices/events';
import { IssueEvents } from '@waldur/issues/events';
import { RoleEvents } from '@waldur/permissions/events';
import { PolicyEvents } from '@waldur/policy/events';
import { ProjectEvents } from '@waldur/project/events';
import { ResourceEvents } from '@waldur/resource/events';
import { SshEvents, UserEvents } from '@waldur/user/events';

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
        // eslint-disable-next-line waldur-custom/no-template-in-translate
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

registry.registerGroup(AuthEvents);
registry.registerGroup(IssueEvents);
registry.registerGroup(OrganizationEvents);
registry.registerGroup(RoleEvents);
registry.registerGroup(InvoiceEvents);
registry.registerGroup(ProjectEvents);
registry.registerGroup(PolicyEvents);
registry.registerGroup(ResourceEvents);
registry.registerGroup(UserEvents);
registry.registerGroup(SshEvents);

export default registry;
