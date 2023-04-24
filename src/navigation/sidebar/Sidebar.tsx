import React, { useEffect, useRef } from 'react';

import {
  DrawerComponent,
  MenuComponent,
  ScrollComponent,
  ToggleComponent,
} from '@waldur/metronic/assets/ts/components';
import { useLayout } from '@waldur/metronic/layout/core';
import { WorkspaceStorage } from '@waldur/workspace/WorkspaceStorage';

import { ContextSelectorToggle } from '../workspace/context-selector/ContextSelectorToggle';

import { BrandName } from './BrandName';
import { SidebarFooter } from './SidebarFooter';
import './Sidebar.scss';

export function getSidebarToggle() {
  const menuElement = document.querySelector('#kt_aside_toggle');
  if (!menuElement) {
    return;
  }
  return ToggleComponent.getInstance(menuElement as HTMLElement);
}

function storeMenuAccordionsStatus(menuElement, event: 'show' | 'hide') {
  const accordions = menuElement.getElementsByClassName('menu-accordion');
  const newStates = [];
  for (let i = 0; i < accordions.length; i++) {
    const txt = accordions
      .item(i)
      .querySelector('.menu-accordion > .menu-link > .menu-title').textContent;
    newStates.push({ title: txt, value: event === 'show' ? 1 : 0 });
  }
  WorkspaceStorage.setSidebarStatus(newStates);
}

export const Sidebar: React.FC = (props) => {
  const sidebarRef = useRef<HTMLElement>(undefined);
  const layout = useLayout();

  useEffect(() => {
    if (sidebarRef?.current) {
      ToggleComponent.reinitialization();
      DrawerComponent.reinitialization();
      ScrollComponent.reinitialization();
      MenuComponent.reinitialization();

      // Expand sidebar when project selector is shown
      const contextSelectorElement =
        document.querySelector('.context-selector');
      if (!contextSelectorElement) {
        return;
      }
      const contextSelector = MenuComponent.getInstance(
        contextSelectorElement as HTMLElement,
      );
      if (!contextSelector) {
        return;
      }
      contextSelector.on('kt.menu.dropdown.shown', function () {
        if (document.body.hasAttribute('data-kt-aside-minimize')) {
          layout.setLayout({
            aside: {
              ...layout.config.aside,
              minimized: true,
            },
          });
        }
      });
    }
  }, [sidebarRef, layout]);

  useEffect(() => {
    if (sidebarRef?.current) {
      // Preserve sidebar collapsed/expanded status (in local storage)
      const menuElement = document.querySelector('#kt_aside_menu');
      if (!menuElement) {
        return;
      }
      const menu = MenuComponent.getInstance(menuElement as HTMLElement);
      if (!menu) {
        return;
      }
      menu.on('kt.menu.accordion.shown', () => {
        storeMenuAccordionsStatus(menuElement, 'show');
      });
      menu.on('kt.menu.accordion.hidden', () => {
        storeMenuAccordionsStatus(menuElement, 'hide');
      });

      // Render preserved sidebar
      const accordionsStatus = WorkspaceStorage.getSidebarStatus();
      if (!accordionsStatus) return;
      accordionsStatus
        .filter((item) => item.value === 1)
        .forEach((item) => {
          const accordions =
            menuElement.getElementsByClassName('menu-accordion');
          for (let i = 0; i < accordions.length; i++) {
            const acc = accordions.item(i);
            const txt = acc.querySelector(
              '.menu-accordion > .menu-link > .menu-title',
            ).textContent;
            if (item.title === txt) {
              const toggle = menu.getItemToggleElement(acc) as HTMLElement;
              toggle.click();
              break;
            }
          }
        });
      WorkspaceStorage.clearSidebarStatus();
    }
  }, [sidebarRef, layout]);

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
      <ContextSelectorToggle />

      <div className="aside-menu flex-column-fluid overflow-hidden">
        <div
          className="hover-scroll-overlay-y my-5 my-lg-5"
          id="kt_aside_menu_wrapper"
          data-kt-scroll="true"
          data-kt-scroll-activate="{default: false, lg: true}"
          data-kt-scroll-height="auto"
          data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_toolbar, #kt_aside_footer"
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
