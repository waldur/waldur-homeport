import * as React from 'react';

import { MenuItem } from './MenuItem';
import { MenuItemType } from './types';
import { useMenuList } from './useMenuList';

export const MenuItemList = ({ items }: { items: MenuItemType[] }) => {
  const { getItemCss, expandedItem, onClick } = useMenuList(items);
  return (
    <>
      {items.map((item, index) => (
        <li key={index} className={getItemCss(item)}>
          <MenuItem item={item} onClick={onClick} />
          {expandedItem === item && item.children && (
            <ul className="nav nav-second-level">
              {item.children.map((child, index) => (
                <li key={index} className={getItemCss(child)}>
                  <MenuItem item={child} onClick={onClick} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </>
  );
};
