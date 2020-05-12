import * as React from 'react';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import './PoweredBy.scss';

export const PoweredBy = () =>
  ENV.poweredByLogo ? (
    <div className="powered-by">
      <div>{translate('Powered by')}</div>
      <div>
        <img src={ENV.poweredByLogo} />
      </div>
    </div>
  ) : null;
