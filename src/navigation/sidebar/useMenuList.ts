import { useRouter, useOnStateChanged } from '@uirouter/react';
import classNames from 'classnames';
import { useState, useEffect, useContext } from 'react';

import { LayoutContext } from '../context';

import { MenuItemType } from './types';

export const useMenuList = (items: MenuItemType[]) => {
  const [expandedItem, setExpandedItem] = useState<MenuItemType>();
  const [activeItem, setActiveItem] = useState<MenuItemType>();
  const router = useRouter();

  const layoutContext = useContext(LayoutContext);

  const matchesSidebar = (item: MenuItemType) =>
    item.key && layoutContext.sidebarKey === item.key;

  const matchesState = (item: MenuItemType) =>
    item.state && router.stateService.is(item.state, item.params);

  const updateItems = () => {
    for (const item of items) {
      if (matchesSidebar(item) || matchesState(item)) {
        setActiveItem(item);
        if (item.children) {
          setExpandedItem(item);
        }
      }
      if (item.children) {
        for (const child of item.children) {
          if (matchesSidebar(child) || matchesState(child)) {
            setActiveItem(child);
            setExpandedItem(item);
            return;
          }
        }
      }
    }
  };

  useEffect(updateItems, [items, layoutContext.sidebarKey]);
  useOnStateChanged(() => updateItems());

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
      router.stateService.go(item.state, item.params);
    }
  };

  return {
    getItemCss,
    expandedItem,
    onClick,
  };
};
