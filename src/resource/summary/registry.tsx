import { ComponentType } from 'react';

const registry = {};

export const register = (
  type: string,
  component: ComponentType<any>,
  useDefaultWrapper = true,
) => {
  registry[type] = {
    component,
    useDefaultWrapper,
  };
};

export const get = (type: string) => {
  return registry[type];
};
