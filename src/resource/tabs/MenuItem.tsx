import classNames from 'classnames';
import React from 'react';

import { wrapTooltip } from '@waldur/table/ActionButton';

import { MenuItemType } from './types';

interface MenuItemProps {
  item: MenuItemType;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item }) => (
  <span>
    {item.icon && (
      <i className={classNames('fa', item.icon, 'fixed-width-icon')}></i>
    )}
    {wrapTooltip(
      item.title.length > 20 ? item.title : null,
      <span className="menu-item-label">{item.title}</span>,
    )}
  </span>
);
