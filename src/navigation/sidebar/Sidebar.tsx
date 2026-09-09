import * as ScrollArea from '@radix-ui/react-scroll-area';
import classNames from 'classnames';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { ENV } from '@/core/config';
import { useLayout } from '@/metronic/layout/core';
import { useTheme } from '@/theme/useTheme';

import { useMobileSidebar } from '../context';

import { BrandName } from './BrandName';
import { SidebarFooter } from './SidebarFooter';

export const Sidebar: React.FC<PropsWithChildren> = (props) => {
  const sidebarRef = useRef<HTMLElement>(undefined);
  const layout = useLayout();
  const [isAsideHovered, setIsAsideHovered] = useState(false);
  const { mobileSidebarOpen, closeMobileSidebar } = useMobileSidebar();

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileSidebar?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileSidebarOpen, closeMobileSidebar]);

  const { theme } = useTheme();
  const configuredStyle = ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE || 'dark';
  const sidebarStyle =
    configuredStyle === 'auto'
      ? theme === 'dark'
        ? 'dark'
        : 'light'
      : configuredStyle;
  const asideClassNames = {
    'aside-dark': sidebarStyle === 'dark',
    'aside-light': sidebarStyle === 'light',
    'aside-primary': sidebarStyle === 'primary',
    'aside-accent': sidebarStyle === 'accent',
    'aside-accent-light': sidebarStyle === 'accent-light',
  };
  const menuClassNames = {
    'menu-title-gray-800': sidebarStyle === 'dark',
    'menu-title-dark-always':
      sidebarStyle === 'light' || sidebarStyle === 'accent-light',
    'menu-title-white': sidebarStyle === 'accent' || sidebarStyle === 'primary',
  };

  return (
    <>
      <nav
        ref={sidebarRef}
        className={classNames(
          'aside aside-hoverable drawer-mobile',
          asideClassNames,
          {
            'drawer-mobile-on': mobileSidebarOpen,
          },
        )}
        onMouseEnter={() => {
          if (layout.config.aside.minimized) setIsAsideHovered(true);
        }}
        onMouseLeave={() => setIsAsideHovered(false)}
      >
        <BrandName isAsideHovered={isAsideHovered} />

        <div className="aside-menu flex-grow-1 overflow-hidden my-4">
          <ScrollArea.Root
            className="aside-scroll-area h-100 w-100"
            type="hover"
          >
            <ScrollArea.Viewport
              className="h-100 w-100"
              id="kt_aside_menu_wrapper"
              data-testid="aside-menu-wrapper"
            >
              <div
                className={classNames(
                  'menu menu-column menu-rounded gap-1 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-bold',
                  menuClassNames,
                )}
                id="kt_aside_menu"
                data-testid="aside-menu"
              >
                {props.children}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="aside-scroll-scrollbar"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="aside-scroll-thumb" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner />
          </ScrollArea.Root>
        </div>
        <SidebarFooter menuClassNames={menuClassNames} />
      </nav>
      {mobileSidebarOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="drawer-overlay"
            data-testid="drawer-overlay"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />,
          document.body,
        )}
    </>
  );
};
