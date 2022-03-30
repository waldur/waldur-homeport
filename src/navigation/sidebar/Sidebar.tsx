import React from 'react';

import { DocsLink } from '@waldur/navigation/header/DocsLink';
import { SupportLink } from '@waldur/navigation/header/SupportLink';

import './Sidebar.css';
import { SidebarMenu } from './SidebarMenu';
import { SidebarMenuProps } from './types';

export const Sidebar: React.FC<SidebarMenuProps> = (props) => (
  <nav className="aside aside-dark aside-hoverable">
    <div className="aside-menu flex-column-fluid">
      <div className="menu menu-column menu-title-gray-800 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500">
        <SidebarMenu {...props} />
        <SupportLink />
        <DocsLink />
      </div>
    </div>
  </nav>
);
