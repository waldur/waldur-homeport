const registry = {};

export const register = (
  type,
  component,
  className = 'resource-details-table',
) => {
  registry[type] = {
    component,
    className,
  };
};

export const get = (type) => {
  return registry[type];
};
