import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import './Logo.scss';

export const Logo: FunctionComponent = () => (
  <div className="logoContainer">
    {ENV.loginLogo ? (
      <img src={ENV.loginLogo} />
    ) : (
      <h1 className="logo-name">{ENV.shortPageTitle}</h1>
    )}
  </div>
);
