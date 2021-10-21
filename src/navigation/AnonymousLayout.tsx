import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { AppFooter } from '@waldur/navigation/AppFooter';
import { SiteHeader } from '@waldur/navigation/header/SiteHeader';

import { CookiesConsent } from './cookies/CookiesConsent';
import './AnonymousLayout.scss';

export const AnonymousLayout: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();
  return (
    <div className="anonymousLayout">
      <CookiesConsent />
      <div className="app-wrap">
        {!state.data?.hideHeader && <SiteHeader />}
        <UIView className="app-content"></UIView>
      </div>
      <AppFooter />
    </div>
  );
};
