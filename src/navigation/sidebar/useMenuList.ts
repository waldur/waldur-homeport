import {
  useRouter,
  useOnStateChanged,
  useCurrentStateAndParams,
} from '@uirouter/react';
import * as classNames from 'classnames';
import * as React from 'react';

import { MenuItemType } from './types';

export const useMenuList = (items: MenuItemType[]) => {
  const [expandedItem, setExpandedItem] = React.useState<MenuItemType>();
  const [activeItem, setActiveItem] = React.useState<MenuItemType>();
  const router = useRouter();

  const { state } = useCurrentStateAndParams();

  const matchesSidebar = (item: MenuItemType) =>
    item.key && state?.data?.sidebarKey === item.key;

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
          if (matchesState(child)) {
            setActiveItem(child);
            setExpandedItem(item);
            return;
          }
        }
      }
    }
  };

  React.useEffect(updateItems, [items]);
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
