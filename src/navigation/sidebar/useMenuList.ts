import * as classNames from 'classnames';
import * as React from 'react';

import { $state } from '@waldur/core/services';

import { MenuItemType } from './types';

export const useMenuList = (items: MenuItemType[]) => {
  const [expandedItem, setExpandedItem] = React.useState<MenuItemType>();
  const [activeItem, setActiveItem] = React.useState<MenuItemType>();

  React.useEffect(() => {
    const matches = (item: MenuItemType) =>
      item.state && $state.is(item.state, item.params);
    for (const item of items) {
      if (matches(item)) {
        setActiveItem(item);
      } else if (item.children) {
        for (const child of item.children) {
          if (matches(child)) {
            setActiveItem(child);
            setExpandedItem(item);
            return;
          }
        }
      }
    }
  }, [items]);

  const getItemCss = (item: MenuItemType) =>
    classNames({
      'active-with-child': item.children && item === activeItem,
      active: item === activeItem,
    });

  const onClick = (item: MenuItemType) => {
    if (item.children) {
      if (expandedItem === item) {
        setExpandedItem(undefined);
      } else {
        setExpandedItem(item);
      }
    } else if (item.action) {
      item.action();
    } else if (item.state) {
      setActiveItem(item);
      $state.go(item.state, item.params);
    }
  };

  return {
    getItemCss,
    expandedItem,
    onClick: onClick,
  };
};
