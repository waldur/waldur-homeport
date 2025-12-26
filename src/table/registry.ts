import { TableOptionsType } from './types';

const registry: Record<string, TableOptionsType> = {};
const refCounts: Record<string, number> = {};

export const registerTable = (options: TableOptionsType) => {
  const { table } = options;
  registry[table] = options;
  refCounts[table] = (refCounts[table] || 0) + 1;
};

export const unregisterTable = (tableName: string) => {
  if (refCounts[tableName]) {
    refCounts[tableName]--;
    if (refCounts[tableName] <= 0) {
      delete registry[tableName];
      delete refCounts[tableName];
    }
  }
};

export const getTableOptions: (name: string) => TableOptionsType = (name) => {
  if (!registry[name]) {
    throw Error(`Loader for datatable ${name} is not found.`);
  }

  return registry[name];
};
