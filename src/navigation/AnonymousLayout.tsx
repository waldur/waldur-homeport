import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';

import { angular2react } from '@waldur/shims/angular2react';

import { AppFooter } from './AppFooter';
import { CookiesConsent } from './cookies/CookiesConsent';

const SiteHeader = angular2react('siteHeader');

export const AnonymousLayout = () => {
  const { state } = useCurrentStateAndParams();
  return (
    <>
      <CookiesConsent />
      <div className="app-wrap footer-indent">
        {!state.data.hideHeader && <SiteHeader />}
        <UIView className="app-content"></UIView>
      </div>
      <AppFooter />
    </>
  );
};
