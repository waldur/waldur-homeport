import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

import './PoweredBy.scss';

export const PoweredBy: FunctionComponent = () =>
  ENV.plugins.WALDUR_CORE.POWERED_BY_LOGO ? (
    <div className="powered-by">
      <div>{translate('Powered by')}</div>
      <div>
        <img src={ENV.plugins.WALDUR_CORE.POWERED_BY_LOGO} />
      </div>
    </div>
  ) : null;
