const registry = {};

export const register = (type, component) => {
  registry[type] = component;
};

export const get = type => {
  return registry[type];
};
