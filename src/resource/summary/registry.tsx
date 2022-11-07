import { ComponentType } from 'react';

const registry = {};

export const register = (type: string, component: ComponentType<any>) => {
  registry[type] = component;
};

export const get = (type: string) => {
  return registry[type];
};
