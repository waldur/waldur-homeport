import { ComponentType } from 'react';

const registry = {};
const registryCustom = {};

export const register = (type: string, component: ComponentType<any>) => {
  registry[type] = component;
};
export const registerCustom = (type: string, component: ComponentType<any>) => {
  registryCustom[type] = component;
};

export const get = (type: string) => {
  return registry[type];
};
export const getCustom = (type: string) => {
  return registryCustom[type];
};
