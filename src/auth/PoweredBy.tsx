import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import './PoweredBy.scss';
import { formatMediaURL } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const PoweredBy: FunctionComponent = () =>
  ENV.plugins.WALDUR_CORE.POWERED_BY_LOGO ? (
    <div className="powered-by">
      <div>{translate('Powered by')}</div>
      <div>
        <img src={formatMediaURL(ENV.plugins.WALDUR_CORE.POWERED_BY_LOGO)} />
      </div>
    </div>
  ) : null;
