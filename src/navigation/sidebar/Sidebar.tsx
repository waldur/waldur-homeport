import classNames from 'classnames';
import React, { PropsWithChildren, useEffect, useRef } from 'react';

import { ENV } from '@waldur/configs/default';
import {
  DrawerComponent,
  MenuComponent,
  ScrollComponent,
  ToggleComponent,
} from '@waldur/metronic/components';
import { useLayout } from '@waldur/metronic/layout/core';

import { BrandName } from './BrandName';
import { SidebarFooter } from './SidebarFooter';

export const Sidebar: React.FC<PropsWithChildren> = (props) => {
  const sidebarRef = useRef<HTMLElement>(undefined);
  const layout = useLayout();

  useEffect(() => {
    if (sidebarRef?.current) {
      ToggleComponent.reinitialization();
      DrawerComponent.reinitialization();
      ScrollComponent.reinitialization();
      MenuComponent.reinitialization();
    }
  }, [sidebarRef, layout]);

  const sidebarStyle = ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE || 'dark';
  const asideClassNames = {
    'aside-dark': sidebarStyle === 'dark',
    'aside-light': sidebarStyle === 'light',
    'aside-accent': sidebarStyle === 'accent',
  };
  const menuClassNames = {
    'menu-title-gray-800': sidebarStyle === 'dark',
    'menu-title-dark-always': sidebarStyle === 'light',
    'menu-title-white': sidebarStyle === 'accent',
  };

  return (
    <nav
      ref={sidebarRef}
      className={classNames('aside aside-hoverable', asideClassNames)}
      data-kt-drawer="true"
      data-kt-drawer-name="aside"
      data-kt-drawer-activate="{default: true, lg: false}"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'200px', '300px': '250px'}"
      data-kt-drawer-direction="start"
      data-kt-drawer-toggle="#kt_aside_mobile_toggle"
    >
      <BrandName />

      <div className="aside-menu flex-grow-1 overflow-hidden">
        <div
          className="hover-scroll-overlay-y my-4"
          id="kt_aside_menu_wrapper"
          data-kt-scroll="true"
          data-kt-scroll-activate="{default: false, lg: true}"
          data-kt-scroll-height="auto"
          data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer"
          data-kt-scroll-wrappers="#kt_aside_menu"
          data-kt-scroll-offset="0"
        >
          <div
            className={classNames(
              'menu menu-column menu-rounded gap-1 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-bold',
              menuClassNames,
            )}
            id="kt_aside_menu"
            data-kt-menu="true"
          >
            {props.children}
          </div>
        </div>
      </div>
      <SidebarFooter menuClassNames={menuClassNames} />
    </nav>
  );
};
