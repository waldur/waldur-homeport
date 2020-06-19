import { TableOptionsType } from './types';

const registry = {};

export const registerTable = (options: TableOptionsType) => {
  registry[options.table] = options;
};

export const getTableOptions: (name: string) => TableOptionsType = name => {
  if (!registry[name]) {
    throw Error(`Loader for datatable ${name} is not found.`);
  }

  return registry[name];
};
