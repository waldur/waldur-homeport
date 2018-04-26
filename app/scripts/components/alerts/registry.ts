import { EventGroup } from '@waldur/events/types';

const registry = [];

export const register = (group: EventGroup) => {
  registry.push(group);
};

export const get = () => {
  return registry;
};
