import { TableOptionsType } from './types';

const registry: Record<string, TableOptionsType> = {};
const refCounts: Record<string, number> = {};

export const registerTable = (options: TableOptionsType) => {
  const { table } = options;
  registry[table] = options;
  refCounts[table] = (refCounts[table] || 0) + 1;
};

/** Returns true when this was the last live instance of the table (i.e. the
 * table is now fully unmounted), so callers can tear down per-table state. */
export const unregisterTable = (tableName: string): boolean => {
  if (refCounts[tableName]) {
    refCounts[tableName]--;
    if (refCounts[tableName] <= 0) {
      delete registry[tableName];
      delete refCounts[tableName];
      return true;
    }
  }
  return false;
};

export const getTableOptions: (name: string) => TableOptionsType = (name) => {
  if (!registry[name]) {
    throw Error(`Loader for datatable ${name} is not found.`);
  }

  return registry[name];
};

export const resetTableRegistry = () => {
  Object.keys(registry).forEach((k) => delete registry[k]);
  Object.keys(refCounts).forEach((k) => delete refCounts[k]);
};
