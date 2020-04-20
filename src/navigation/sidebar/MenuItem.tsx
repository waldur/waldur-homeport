import * as classNames from 'classnames';
import * as React from 'react';
import * as Label from 'react-bootstrap/lib/Label';

import { translate } from '@waldur/i18n';

import { MenuItemType } from './types';

interface MenuItemProps {
  item: MenuItemType;
  onClick(item: MenuItemType): void;
  counter?: number;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  item,
  onClick,
  counter,
}) => (
  <a onClick={() => onClick(item)}>
    <i className={classNames('fa', item.icon, 'fixed-width-icon')}></i>
    <span className="nav-label">{translate(item.label)}</span>
    {Number.isInteger(counter) ? (
      <Label className="pull-right">{counter}</Label>
    ) : null}
    {Array.isArray(item.children) && <span className="fa arrow"></span>}
  </a>
);
