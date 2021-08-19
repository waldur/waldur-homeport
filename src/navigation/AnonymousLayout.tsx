import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { AppFooter } from '@waldur/navigation/AppFooter';
import { SiteHeader } from '@waldur/navigation/header/SiteHeader';

import { CookiesConsent } from './cookies/CookiesConsent';

export const AnonymousLayout: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();
  return (
    <>
      <CookiesConsent />
      <div className="app-wrap">
        {!state.data?.hideHeader && <SiteHeader />}
        <UIView className="app-content"></UIView>
      </div>
      {!state.data?.hideFooter && <AppFooter />}
    </>
  );
};
