import * as React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

import { LanguageSelectorMenuItem } from '@waldur/i18n/LanguageSelectorMenuItem';
import { DocsLink } from '@waldur/navigation/header/DocsLink';
import { SupportLink } from '@waldur/navigation/header/SupportLink';
import { connectAngularComponent } from '@waldur/store/connect';
import { UserDropdownMenu } from '@waldur/user/UserDropdownMenu';

import './Sidebar.css';
import { BrandName } from './BrandName';
import { MenuItemList } from './MenuItemList';
import { MenuItemType } from './types';

export const Sidebar = ({ items }: { items: MenuItemType[] }) => (
  <nav className="navbar-default navbar-static-side" role="navigation">
    <Scrollbars style={{ height: '100%' }} className="sidebar-collapse">
      <ul className="nav metismenu" id="side-menu">
        <BrandName />
        <UserDropdownMenu />
        <MenuItemList items={items} />
      </ul>
      <ul className="nav metismenu visible-xs">
        <SupportLink />
        <LanguageSelectorMenuItem />
        <DocsLink />
      </ul>
    </Scrollbars>
  </nav>
);

export default connectAngularComponent(Sidebar, ['items']);
