import { UIView } from '@uirouter/react';
import * as React from 'react';

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
}

export const Layout: React.FC<LayoutProps> = ({
  sidebar,
  pageClass,
  hideBreadcrumbs,
  pageTitle,
  actions,
  children,
}) => (
  <>
    {sidebar}
    <div id="page-wrapper" className={pageClass}>
      <CookiesConsent />
      <AppHeader />
      {hideBreadcrumbs ? null : (
        <div className="row wrapper white-bg page-heading">
          <div className="col-lg-12">
            {pageTitle ? <h2>{pageTitle}</h2> : null}
            {actions}
            <BreadcrumbsContainer />
          </div>
        </div>
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
