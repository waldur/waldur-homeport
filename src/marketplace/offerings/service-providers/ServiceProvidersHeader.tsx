import { FunctionComponent } from 'react';

import illustration from '@waldur/images/service-providers/undraw_Pitching_re_fpgk.svg';

import { Description } from './Description';
import { Logo } from './Logo';
import './ServiceProvidersHeader.scss';

export const ServiceProvidersHeader: FunctionComponent = () => (
  <div className="serviceProvidersHeader">
    <div>
      <Logo />
      <Description />
    </div>
    <img src={illustration} alt="header" />
  </div>
);
