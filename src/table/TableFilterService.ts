import { uniqueId } from 'lodash';

import { getItem, removeItem, setItem } from '@waldur/auth/AuthStorage';

const STORAGE_FOR_SAVED_FILTERS = 'localStorage';

export interface TableFiltersGroup {
  id: string;
  title: string;
  date: string;
  values: any;
}

class TableFilterServiceClass {
  addOrReplace = (
    key: string,
    filtersGroup: Omit<TableFiltersGroup, 'id'> & { id?: string },
  ) => {
    const prevList = this.list(key);
    let id = filtersGroup.id;
    if (!id) {
      id = uniqueId();
      while (prevList.some((p) => p.id === id)) {
        id = uniqueId();
      }
    }
    const newGroup = { ...filtersGroup, id };
    const index = prevList.findIndex((p) => p.id === id);
    let newData;
    if (index > -1) {
      prevList.splice(index, 1, newGroup);
      newData = JSON.stringify(prevList);
    } else {
      newData = JSON.stringify(prevList.concat(newGroup));
    }
    setItem(key, newData, STORAGE_FOR_SAVED_FILTERS);
  };

  list = (key: string): TableFiltersGroup[] => {
    const prevList = getItem(key, STORAGE_FOR_SAVED_FILTERS);
    if (prevList) {
      try {
        const jsonList = JSON.parse(prevList);
        if (Array.isArray(jsonList)) {
          return jsonList;
        }
      } catch (error) {
        removeItem(key, STORAGE_FOR_SAVED_FILTERS);
      }
    }
    return [];
  };

  remove = (key: string, filtersGroup: TableFiltersGroup) => {
    const prevList = this.list(key);
    const newList = prevList.filter((p) => p.id !== filtersGroup.id);
    setItem(key, JSON.stringify(newList), STORAGE_FOR_SAVED_FILTERS);
  };
}

export const TableFilterService = new TableFilterServiceClass();
