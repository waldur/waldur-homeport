import { FunctionComponent } from 'react';

import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import './PoweredBy.scss';

export const PoweredBy: FunctionComponent = () =>
  ENV.plugins.WALDUR_CORE.POWERED_BY_LOGO ? (
    <div className="powered-by">
      <div>{translate('Powered by')}</div>
      <div>
        <img src={getIconUrl('powered_by_logo')} alt="Powered by" />
      </div>
    </div>
  ) : null;
