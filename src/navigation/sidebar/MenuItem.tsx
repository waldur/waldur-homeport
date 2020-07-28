import * as classNames from 'classnames';
import * as React from 'react';
import * as Label from 'react-bootstrap/lib/Label';

import { wrapTooltip } from '@waldur/table/ActionButton';

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
    {wrapTooltip(
      item.label.length > 20 ? item.label : null,
      <span className="nav-label">{item.label}</span>,
    )}
    {Number.isInteger(counter) ? (
      <Label className="pull-right">{counter}</Label>
    ) : null}
    {Array.isArray(item.children) && <span className="fa arrow"></span>}
  </a>
);
