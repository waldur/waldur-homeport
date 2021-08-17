import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import './Description.scss';

export const Description: FunctionComponent = () => (
  <div className="description">
    <h1>
      {translate('Welcome to {pageTitle}!', {
        pageTitle: ENV.shortPageTitle,
      })}
    </h1>
    <p>{ENV.plugins.WALDUR_CORE.SITE_DESCRIPTION}</p>
  </div>
);
