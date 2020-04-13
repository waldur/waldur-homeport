import * as React from 'react';

import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const InvalidQuotaPage = () => {
  const goBack = () => {
    ngInjector.get('NavigationUtilsService').goBack();
  };
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
