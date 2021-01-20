import { UIView } from '@uirouter/react';
import classNames from 'classnames';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { getUser } from '@waldur/workspace/selectors';

import { AppFooter } from './AppFooter';
import { BreadcrumbsContainer } from './breadcrumbs/BreadcrumbsContainer';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppHeader } from './header/AppHeader';
import { getTitle } from './title';

interface LayoutProps {
  sidebar: React.ReactNode;
  pageClass?: string;
  hideBreadcrumbs?: boolean;
  actions?: React.ReactNode;
  sidebarClass?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  sidebar,
  pageClass,
  hideBreadcrumbs,
  actions,
  children,
  sidebarClass,
}) => {
  const pageTitle = useSelector(getTitle);
  const currentUser = useSelector(getUser);
  if (!currentUser) {
    return null;
  }
  return (
    <>
      {sidebar}
      <div id="page-wrapper" className={pageClass}>
        <CookiesConsent />
        <AppHeader />
        {hideBreadcrumbs ? null : (
          <Row
            className={classNames(
              'wrapper white-bg page-heading',
              sidebarClass,
            )}
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
};

Layout.defaultProps = {
  hideBreadcrumbs: false,
  pageClass: 'white-bg',
};
