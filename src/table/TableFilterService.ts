import { nextId } from '@/core/nextId';

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
      id = nextId();
      while (prevList.some((p) => p.id === id)) {
        id = nextId();
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
    localStorage.setItem(key, newData);
  };

  list = (key: string): TableFiltersGroup[] => {
    const prevList = localStorage.getItem(key);
    if (prevList) {
      try {
        const jsonList = JSON.parse(prevList);
        if (Array.isArray(jsonList)) {
          return jsonList;
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
    return [];
  };

  remove = (key: string, filtersGroup: TableFiltersGroup) => {
    const prevList = this.list(key);
    const newList = prevList.filter((p) => p.id !== filtersGroup.id);
    localStorage.setItem(key, JSON.stringify(newList));
  };
}

export const TableFilterService = new TableFilterServiceClass();
