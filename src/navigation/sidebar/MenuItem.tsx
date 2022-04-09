import { UISref, UISrefActive } from '@uirouter/react';
import classNames from 'classnames';
import React from 'react';

import { MenuItemType } from './types';

interface MenuItemProps {
  item: MenuItemType;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item }) => (
  <UISrefActive class="show">
    <div className="menu-item" data-kt-menu-trigger="click">
      <UISref to={item.state} params={item.params}>
        <a className="menu-link without-sub">
          <span className="menu-icon">
            <i className={classNames('fa', item.icon, 'fixed-width-icon')}></i>
          </span>
          <span className="menu-title">{item.label}</span>
        </a>
      </UISref>
    </div>
  </UISrefActive>
);
