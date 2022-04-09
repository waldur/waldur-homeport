import React from 'react';

import { DocsLink } from '@waldur/navigation/header/DocsLink';
import { SupportLink } from '@waldur/navigation/header/SupportLink';

import './Sidebar.css';
import { BrandName } from './BrandName';
import { SidebarMenu } from './SidebarMenu';
import { SidebarMenuProps } from './types';

export const Sidebar: React.FC<SidebarMenuProps> = (props) => (
  <nav
    className="aside aside-dark aside-hoverable"
    data-kt-drawer="true"
    data-kt-drawer-name="aside"
    data-kt-drawer-activate="{default: true, lg: false}"
    data-kt-drawer-overlay="true"
    data-kt-drawer-width="{default:'200px', '300px': '250px'}"
    data-kt-drawer-direction="start"
    data-kt-drawer-toggle="#kt_aside_mobile_toggle"
  >
    <BrandName />
    <div className="aside-menu flex-column-fluid">
      <div
        className="hover-scroll-overlay-y my-5 my-lg-5"
        id="kt_aside_menu_wrapper"
        data-kt-scroll="true"
        data-kt-scroll-activate="{default: false, lg: true}"
        data-kt-scroll-height="auto"
        data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer"
        data-kt-scroll-wrappers="#kt_aside_menu"
        data-kt-scroll-offset="0"
      >
        <div className="menu menu-column menu-title-gray-800 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500">
          <SidebarMenu {...props} />
          <SupportLink />
          <DocsLink />
        </div>
      </div>
    </div>
  </nav>
);
