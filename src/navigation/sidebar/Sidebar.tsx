import React from 'react';

import { DocsLink } from '@waldur/navigation/header/DocsLink';
import { SupportLink } from '@waldur/navigation/header/SupportLink';

import './Sidebar.css';
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
    <div className="aside-logo flex-column-auto" id="kt_aside_logo">
      <a href="/metronic8/demo1/../demo1/index.html">
        <img
          alt="Logo"
          src="https://preview.keenthemes.com/metronic8/demo1/assets/media/logos/logo-1-dark.svg"
          className="h-25px logo"
        />
      </a>
      <div
        id="kt_aside_toggle"
        className="btn btn-icon w-auto px-0 btn-active-color-primary aside-toggle"
        data-kt-toggle="true"
        data-kt-toggle-state="active"
        data-kt-toggle-target="body"
        data-kt-toggle-name="aside-minimize"
      >
        <span className="svg-icon svg-icon-1 rotate-180">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              opacity="0.5"
              d="M14.2657 11.4343L18.45 7.25C18.8642 6.83579 18.8642 6.16421 18.45 5.75C18.0358 5.33579 17.3642 5.33579 16.95 5.75L11.4071 11.2929C11.0166 11.6834 11.0166 12.3166 11.4071 12.7071L16.95 18.25C17.3642 18.6642 18.0358 18.6642 18.45 18.25C18.8642 17.8358 18.8642 17.1642 18.45 16.75L14.2657 12.5657C13.9533 12.2533 13.9533 11.7467 14.2657 11.4343Z"
              fill="currentColor"
            ></path>
            <path
              d="M8.2657 11.4343L12.45 7.25C12.8642 6.83579 12.8642 6.16421 12.45 5.75C12.0358 5.33579 11.3642 5.33579 10.95 5.75L5.40712 11.2929C5.01659 11.6834 5.01659 12.3166 5.40712 12.7071L10.95 18.25C11.3642 18.6642 12.0358 18.6642 12.45 18.25C12.8642 17.8358 12.8642 17.1642 12.45 16.75L8.2657 12.5657C7.95328 12.2533 7.95328 11.7467 8.2657 11.4343Z"
              fill="currentColor"
            ></path>
          </svg>
        </span>
      </div>
    </div>
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
