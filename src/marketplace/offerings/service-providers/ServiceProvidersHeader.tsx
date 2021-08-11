import { FunctionComponent } from 'react';

import { Description } from '@waldur/marketplace/offerings/service-providers/Description';
import { Logo } from '@waldur/marketplace/offerings/service-providers/Logo';
import './ServiceProvidersHeader.scss';

const illustration = require('@waldur/images/service-providers/undraw_Pitching_re_fpgk.svg');

export const ServiceProvidersHeader: FunctionComponent = () => (
  <div className="serviceProvidersHeader">
    <div>
      <Logo />
      <Description />
    </div>
    <img src={illustration} />
  </div>
);
