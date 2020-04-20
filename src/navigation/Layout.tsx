import * as React from 'react';

import { angular2react } from '@waldur/shims/angular2react';

import { AppFooter } from './AppFooter';
import { BreadcrumbsContainer } from './breadcrumbs/BreadcrumbsContainer';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppHeader } from './header/AppHeader';

const UIView = angular2react('uiView');

interface LayoutProps {
  sidebar: React.ReactNode;
  pageClass?: string;
  hideBreadcrumbs?: boolean;
  pageTitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  sidebar,
  pageClass,
  hideBreadcrumbs,
  pageTitle,
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
            <BreadcrumbsContainer />
          </div>
        </div>
      )}
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
