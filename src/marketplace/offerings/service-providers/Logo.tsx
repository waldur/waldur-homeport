import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { formatMediaURL } from '@waldur/core/utils';

import './Logo.scss';

export const Logo: FunctionComponent = () => (
  <div className="logoContainer">
    <img src={formatMediaURL(ENV.plugins.WALDUR_CORE.LOGIN_LOGO)} />
  </div>
);
