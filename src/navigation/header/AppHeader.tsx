import * as React from 'react';
import * as Navbar from 'react-bootstrap/lib/Navbar';
import * as Row from 'react-bootstrap/lib/Row';

import { LanguageSelector } from '@waldur/i18n/LanguageSelector';
import { ShoppingCartIndicator } from '@waldur/marketplace/cart/ShoppingCartIndicator';
import { ComparisonIndicator } from '@waldur/marketplace/compare/ComparisonIndicator';
import { PendingOrderIndicator } from '@waldur/marketplace/orders/PendingOrderIndicator';
import { SidebarToggle } from '@waldur/navigation/sidebar/SidebarToggle';
import { WorkspaceLabel } from '@waldur/navigation/workspace/WorkspaceLabel';

import { SelectWorkspaceToggle } from '../workspace/SelectWorkspaceToggle';

import { DocsLink } from './DocsLink';
import { ExternalLinks } from './ExternalLinks';
import { LogoutLink } from './LogoutLink';
import { MainSearch } from './MainSearch';
import { SupportLink } from './SupportLink';

export const AppHeader = () => (
  <Row className="border-bottom">
    <Navbar staticTop bsStyle="inverse" fluid className="m-b-none">
      <div style={{ display: 'flex' }}>
        <Navbar.Header className="m-b-sm">
          <SidebarToggle />
          <SelectWorkspaceToggle />
          <MainSearch />
        </Navbar.Header>
        <WorkspaceLabel />
        <ul className="nav navbar-top-links navbar-right hidden-xs-stable">
          <ExternalLinks />
          <SupportLink />
          <DocsLink />
          <ComparisonIndicator />
          <PendingOrderIndicator />
          <ShoppingCartIndicator />
          <LanguageSelector />
          <LogoutLink />
        </ul>
      </div>
    </Navbar>
  </Row>
);
