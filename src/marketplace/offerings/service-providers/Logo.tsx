import { FunctionComponent } from 'react';

import { fixURL } from '@waldur/core/api';
import './Logo.scss';

export const Logo: FunctionComponent = () => (
  <div className="logoContainer">
    <img src={fixURL('/icons/login_logo/')} />
  </div>
);
