import { UIView } from '@uirouter/react';
import * as classNames from 'classnames';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { AppFooter } from './AppFooter';
import { BreadcrumbsContainer } from './breadcrumbs/BreadcrumbsContainer';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppHeader } from './header/AppHeader';

interface LayoutProps {
  sidebar: React.ReactNode;
  pageClass?: string;
  hideBreadcrumbs?: boolean;
  pageTitle?: string;
  actions?: React.ReactNode;
  sidebarClass?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  sidebar,
  pageClass,
  hideBreadcrumbs,
  pageTitle,
  actions,
  children,
  sidebarClass,
}) => (
  <>
    {sidebar}
    <div id="page-wrapper" className={pageClass}>
      <CookiesConsent />
      <AppHeader />
      {hideBreadcrumbs ? null : (
        <Row
          className={classNames('wrapper white-bg page-heading', sidebarClass)}
        >
          <Col lg={actions ? 7 : 12}>
            {pageTitle ? <h2>{pageTitle}</h2> : null}
            <BreadcrumbsContainer />
          </Col>
          {actions && (
            <Col lg={5}>
              <div className="title-action">{actions}</div>
            </Col>
          )}
        </Row>
      )}
      {children}
      <div className="footer-indent">
        <UIView />
      </div>
      <AppFooter />
    </div>
  </>
);

Layout.defaultProps = {
  hideBreadcrumbs: false,
  pageClass: 'white-bg',
};
