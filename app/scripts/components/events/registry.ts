let registry = {};

export const register = formatters => {
  registry = {...registry, ...formatters};
};

export const get = type => {
  return registry[type];
};
