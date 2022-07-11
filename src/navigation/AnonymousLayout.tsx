import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useEffect, FunctionComponent } from 'react';

import { AppFooter } from '@waldur/navigation/AppFooter';
import { SiteHeader } from '@waldur/navigation/header/SiteHeader';

import { CookiesConsent } from './cookies/CookiesConsent';

export const AnonymousLayout: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();
  useEffect(() => {
    document.body.className = '';
  });
  return (
    <div className="page d-flex flex-row flex-column-fluid">
      <div className="wrapper d-flex flex-column flex-row-fluid">
        <CookiesConsent />
        {!state.data?.hideHeader && <SiteHeader />}
        <div className="content d-flex flex-column flex-column-fluid">
          <div className="post d-flex flex-column-fluid">
            <div className="container-xxl">
              <UIView />
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  );
};
