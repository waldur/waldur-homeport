import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import './Logo.scss';

export const Logo: FunctionComponent = () => (
  <div className="logoContainer">
    {ENV.plugins.WALDUR_CORE.LOGIN_LOGO ? (
      <img src={ENV.plugins.WALDUR_CORE.LOGIN_LOGO} />
    ) : (
      <h1 className="logo-name">{ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}</h1>
    )}
  </div>
);
