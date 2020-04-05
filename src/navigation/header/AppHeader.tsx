import * as React from 'react';
import * as Navbar from 'react-bootstrap/lib/Navbar';
import * as Row from 'react-bootstrap/lib/Row';

import { isFeatureVisible } from '@waldur/features/connect';
import { ShoppingCartIndicator } from '@waldur/marketplace/cart/ShoppingCartIndicator';
import { PendingOrderIndicator } from '@waldur/marketplace/orders/PendingOrderIndicator';
import { angular2react } from '@waldur/shims/angular2react';
import { connectAngularComponent } from '@waldur/store/connect';

import { ExternalLinks } from './ExternalLinks';

const SidebarToggle = angular2react('sidebarToggle');
const SelectWorkspaceToggle = angular2react('selectWorkspaceToggle');
const MainSearch = angular2react('mainSearch');
const IntroButton = angular2react('introButton');
const SupportLink = angular2react('supportLink');
const DocsLink = angular2react('docsLink');
const ComparisonIndicator = angular2react('comparisonIndicator');
const LanguageSelector = angular2react('languageSelector');
const LogoutLink = angular2react('logoutLink');

export const AppHeader = () => (
  <Row className="border-bottom">
    <Navbar staticTop bsStyle="inverse" fluid className="m-b-none">
      <Navbar.Header className="m-b-sm">
        <SidebarToggle />
        <SelectWorkspaceToggle />
        {isFeatureVisible('mainSearch') && <MainSearch />}
      </Navbar.Header>
      <ul className="nav navbar-top-links navbar-right hidden-xs-stable">
        {isFeatureVisible('intro') && <IntroButton />}
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

export default connectAngularComponent(AppHeader);
