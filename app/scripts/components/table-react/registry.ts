import { TableOptions } from './types';

const registry = {};

export const registerTable = (options: TableOptions) => {
  registry[options.table] = options;
};

export const getTableOptions: (name: string) => TableOptions = name => {
  if (!registry[name]) {
    throw Error(`Loader for datatable ${name} is not found.`);
  }

  return registry[name];
};
