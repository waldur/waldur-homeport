interface ResourceConfiguration {
  getHeader: (resource: any) => string;
}

const registry = {};

export const register = (type: string, config: ResourceConfiguration) => {
  registry[type] = config;
};

export const get = type => {
  return registry[type];
};
