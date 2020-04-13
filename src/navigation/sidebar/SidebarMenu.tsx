import * as React from 'react';

import { MenuItem } from './MenuItem';
import { SidebarMenuProps, MenuItemType } from './types';
import { useMenuList } from './useMenuList';

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  items,
  counters,
}) => {
  const { getItemCss, expandedItem, onClick } = useMenuList(items);

  const ItemList: React.FC<{
    items: MenuItemType[];
    render?(item: MenuItemType): React.ReactNode;
  }> = ({ items, render }) => (
    <>
      {items.map((item, index) => (
        <li key={index} className={getItemCss(item)}>
          <MenuItem
            item={item}
            onClick={onClick}
            counter={
              counters && item.countFieldKey && counters[item.countFieldKey]
            }
          />
          {render && render(item)}
        </li>
      ))}
    </>
  );

  return (
    <ItemList
      items={items}
      render={item =>
        expandedItem === item &&
        item.children && (
          <ul className="nav nav-second-level">
            <ItemList items={item.children} />
          </ul>
        )
      }
    />
  );
};

SidebarMenu.defaultProps = {
  items: [],
  counters: {},
};
