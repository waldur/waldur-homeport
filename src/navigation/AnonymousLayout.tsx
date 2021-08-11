import { UIView } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { AnonymousFooter } from './AnonymousFooter';
import { AnonymousHeader } from './AnonymousHeader';
import { CookiesConsent } from './cookies/CookiesConsent';

export const AnonymousLayout: FunctionComponent = () => (
  <>
    <CookiesConsent />
    <AnonymousHeader />
    <div className="app-wrap">
      <UIView className="app-content"></UIView>
    </div>
    <AnonymousFooter />
  </>
);
