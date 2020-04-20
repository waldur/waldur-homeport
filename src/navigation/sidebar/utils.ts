import { isFeatureVisible } from '@waldur/features/connect';

import { MenuItemType } from './types';

export const getCounterFields = (items: MenuItemType[]): string[] => {
  const counters = [];
  const visitItem = (item: MenuItemType) => {
    if (
      item.hasOwnProperty('countFieldKey') &&
      isFeatureVisible(item.feature)
    ) {
      counters.push(item.countFieldKey);
    }
  };
  items.forEach(item => {
    visitItem(item);
    if (item.children) {
      item.children.forEach(visitItem);
    }
  });
  return counters;
};

const sortItems = (items: MenuItemType[]) => {
  const compareIndex = (a, b) => a.index - b.index;
  const compareLabel = (a, b) => a.label.localeCompare(b.label);
  items.sort(compareIndex);
  items.forEach(parent => {
    if (parent.children) {
      if (parent.orderByLabel) {
        parent.children.sort(compareLabel);
      } else {
        parent.children.sort(compareIndex);
      }
    }
  });
};

export const filterItems = (items: MenuItemType[]) => {
  const predicate = (item: MenuItemType) => isFeatureVisible(item.feature);
  return items.filter(predicate).map(item => {
    if (!item.children) {
      return item;
    }
    return {
      ...item,
      children: item.children.filter(predicate),
    };
  });
};

export const mergeItems = (
  items: MenuItemType[],
  customItems: MenuItemType[],
) => {
  const children = customItems.reduce((map, item) => {
    if (item.parent) {
      map[item.parent] = map[item.parent] || [];
      map[item.parent].push(item);
    }
    return map;
  }, {});

  const merged = [
    ...items.map(item => ({
      ...item,
      children: children[item.key]
        ? [...item.children, ...children[item.key]]
        : item.children,
    })),
    ...customItems.filter(i => !i.parent),
  ];

  sortItems(merged);
  return filterItems(merged);
};
