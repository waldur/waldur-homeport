import * as React from 'react';
import * as Navbar from 'react-bootstrap/lib/Navbar';
import * as Row from 'react-bootstrap/lib/Row';

import { LanguageSelector } from '@waldur/i18n/LanguageSelector';
import { ShoppingCartIndicator } from '@waldur/marketplace/cart/ShoppingCartIndicator';
import { ComparisonIndicator } from '@waldur/marketplace/compare/ComparisonIndicator';
import { PendingOrderIndicator } from '@waldur/marketplace/orders/PendingOrderIndicator';
import { SidebarToggle } from '@waldur/navigation/sidebar/SidebarToggle';
import { angular2react } from '@waldur/shims/angular2react';

import { DocsLink } from './DocsLink';
import { ExternalLinks } from './ExternalLinks';
import { IntroButton } from './IntroButton';
import { LogoutLink } from './LogoutLink';
import { MainSearch } from './MainSearch';
import { SupportLink } from './SupportLink';

const SelectWorkspaceToggle = angular2react('selectWorkspaceToggle');

export const AppHeader = () => (
  <Row className="border-bottom">
    <Navbar staticTop bsStyle="inverse" fluid className="m-b-none">
      <Navbar.Header className="m-b-sm">
        <SidebarToggle />
        <SelectWorkspaceToggle />
        <MainSearch />
      </Navbar.Header>
      <ul className="nav navbar-top-links navbar-right hidden-xs-stable">
        <IntroButton />
        <ExternalLinks />
        <SupportLink />
        <DocsLink />
        <ComparisonIndicator />
        <PendingOrderIndicator />
        <ShoppingCartIndicator />
        <LanguageSelector />
        <LogoutLink />
      </ul>
    </Navbar>
  </Row>
);
