import * as classNames from 'classnames';
import * as React from 'react';

import { translate } from '@waldur/i18n';

import { MenuItemType } from './types';

interface MenuItemProps {
  item: MenuItemType;
  onClick(item: MenuItemType): void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item, onClick }) => (
  <a onClick={() => onClick(item)}>
    <i className={classNames('fa', item.icon, 'fixed-width-icon')}></i>
    <span className="nav-label">{translate(item.label)}</span>
    {item.countFieldKey && (
      <span className="label label-default pull-right">{item.count}</span>
    )}

    {item.children && <span className="fa arrow"></span>}
  </a>
);
