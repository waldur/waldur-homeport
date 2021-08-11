import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import './Logo.scss';

export const Logo: FunctionComponent = () => (
  <div className="logoContainer">
    {ENV.loginLogo ? (
      <img src={ENV.loginLogo} />
    ) : (
      <>
        <h1 className="logo-name">{ENV.shortPageTitle}</h1>
        <h4>
          {translate('Welcome to {pageTitle}!', {
            pageTitle: ENV.shortPageTitle,
          })}
        </h4>
      </>
    )}
  </div>
);
