import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { goBack } from '@waldur/navigation/utils';

export const InvalidQuotaPage: FunctionComponent = () => {
  useTitle(translate('Quota has been reached.'));
  return (
    <div className="middle-box text-center">
      <h1>403</h1>
      <p className="font-bold">
        {translate('You have exceeded maximum number of quotas.')}
      </p>
      <p>
        <a onClick={goBack}>&lt; {translate('Back')}</a>
      </p>
    </div>
  );
};
