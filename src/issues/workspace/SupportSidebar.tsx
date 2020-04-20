import * as React from 'react';

import { ngInjector } from '@waldur/core/services';
import { Sidebar } from '@waldur/navigation/sidebar/Sidebar';
import { MenuItemType } from '@waldur/navigation/sidebar/types';

export const SupportSidebar = () => {
  const [items, setItems] = React.useState<MenuItemType[]>([]);

  React.useEffect(() => {
    ngInjector
      .get('IssueNavigationService')
      .getSidebarItems()
      .then(setItems);
  }, []);

  return <Sidebar items={items} />;
};
