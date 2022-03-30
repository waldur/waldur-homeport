import classNames from 'classnames';
import React from 'react';

import { MenuItemType } from './types';

interface MenuItemProps {
  item: MenuItemType;
  onClick(item: MenuItemType): void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item, onClick }) => (
  <div className="menu-item" data-kt-menu-trigger="click">
    <a className="menu-link without-sub" onClick={() => onClick(item)}>
      <span className="menu-icon">
        <i className={classNames('fa', item.icon, 'fixed-width-icon')}></i>
      </span>
      <span className="menu-title">{item.label}</span>
      {Array.isArray(item.children) && <span className="fa arrow"></span>}
    </a>
  </div>
);
