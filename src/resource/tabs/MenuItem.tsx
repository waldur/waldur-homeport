import classNames from 'classnames';
import React from 'react';

import { wrapTooltip } from '@waldur/table/ActionButton';

import { MenuItemType } from './types';

interface MenuItemProps {
  item: MenuItemType;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item }) => (
  <>
    {item.icon && (
      <i className={classNames('fa', item.icon, 'fixed-width-icon')}></i>
    )}
    {wrapTooltip(
      item.title.length > 20 ? item.title : null,
      <a className="menu-item-label">{item.title}</a>,
    )}
  </>
);
