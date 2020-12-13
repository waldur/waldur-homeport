import { ComponentType } from 'react';

const registry = {};

export const register = (
  type: string,
  component: ComponentType<any>,
  className = 'resource-details-table',
) => {
  registry[type] = {
    component,
    className,
  };
};

export const get = (type: string) => {
  return registry[type];
};
