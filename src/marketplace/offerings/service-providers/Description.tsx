import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

export const Description: FunctionComponent = () => (
  <div className="description">
    <h1>{translate('Description')}</h1>
    {/*fixme: SITE_DESCRIPTION is missing from ENV (configs api endpoint).*/}
    <p>{ENV.SITE_DESCRIPTION}</p>
  </div>
);
