import { translate } from '@waldur/i18n';

import { EventGroup } from './types';

const groups = [];
const formatters = {};

const registerGroup = (group: EventGroup) => {
  groups.push(group);
  for (const type of group.events) {
    const defaultFormatter = event => {
      const mapper = group.context || (x => x);
      const context = {event, ...mapper(event)};
      return translate(type.title, context);
    };
    formatters[type.key] = type.formatter || defaultFormatter;
  }
};

const getGroups = () => groups;

const formatEvent = event => {
  const formatter = formatters[event.event_type];
  if (formatter) {
    return formatter(event);
  } else {
    return event.message;
  }
};

export default {
  registerGroup,
  getGroups,
  formatEvent,
};
