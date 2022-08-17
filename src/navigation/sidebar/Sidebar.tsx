import React, { useEffect, useRef } from 'react';

import './Sidebar.css';

import {
  DrawerComponent,
  ScrollComponent,
  ToggleComponent,
} from '@waldur/metronic/assets/ts/components';

import { QuickProjectSelectorToggle } from '../workspace/quick-project-selector/QuickProjectSelectorToggle';

import { BrandName } from './BrandName';
import { SidebarFooter } from './SidebarFooter';

export const Sidebar: React.FC = (props) => {
  const sidebarRef = useRef<HTMLElement>(undefined);
  useEffect(() => {
    if (sidebarRef?.current) {
      ToggleComponent.reinitialization();
      DrawerComponent.reinitialization();
      ScrollComponent.reinitialization();
    }
  }, [sidebarRef]);
  return (
    <nav
      ref={sidebarRef}
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
      <QuickProjectSelectorToggle />

      <div className="aside-menu flex-column-fluid">
        <div
          className="hover-scroll-overlay-y my-5 my-lg-5"
          id="kt_aside_menu_wrapper"
          data-kt-scroll="true"
          data-kt-scroll-activate="{default: false, lg: true}"
          data-kt-scroll-height="auto"
          data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_buttons, #kt_aside_footer"
          data-kt-scroll-wrappers="#kt_aside_menu"
          data-kt-scroll-offset="0"
        >
          <div
            className="menu menu-column menu-title-gray-800 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500"
            id="kt_aside_menu"
            data-kt-menu="true"
          >
            {props.children}
          </div>
        </div>
      </div>
      <SidebarFooter />
    </nav>
  );
};
