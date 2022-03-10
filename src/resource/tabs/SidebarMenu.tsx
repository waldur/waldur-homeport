import { FC } from 'react';
import { Nav, NavItem } from 'react-bootstrap';

import { MenuItem } from './MenuItem';
import { SidebarMenuProps, MenuItemType } from './types';

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ items }) => {
  const ItemList: FC<{
    items: MenuItemType[];
  }> = ({ items }) => (
    <Nav stacked className="page-sidebar-menu">
      {items.map(
        (item) =>
          (item.visible === undefined || item.visible) && (
            <NavItem key={item.key} eventKey={item.key}>
              <MenuItem item={item} />
            </NavItem>
          ),
      )}
    </Nav>
  );

  return <ItemList items={items} />;
};

SidebarMenu.defaultProps = {
  items: [],
};
