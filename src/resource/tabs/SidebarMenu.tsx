import { FC } from 'react';
import { Nav } from 'react-bootstrap';

import { MenuItem } from './MenuItem';
import { SidebarMenuProps, MenuItemType } from './types';

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ items }) => {
  const ItemList: FC<{
    items: MenuItemType[];
  }> = ({ items }) => (
    <Nav className="page-sidebar-menu">
      {items.map(
        (item) =>
          (item.visible === undefined || item.visible) && (
            <Nav.Link key={item.key}>
              <MenuItem item={item} />
            </Nav.Link>
          ),
      )}
    </Nav>
  );

  return <ItemList items={items} />;
};

SidebarMenu.defaultProps = {
  items: [],
};
