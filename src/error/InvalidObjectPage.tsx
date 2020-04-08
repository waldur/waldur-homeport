import * as React from 'react';

import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const InvalidObjectPage = () => {
  const goBack = () => {
    ngInjector.get('NavigationUtilsService').goBack();
  };
  return (
    <div className="middle-box text-center">
      <h1>404</h1>
      <p className="font-bold">
        {translate(
          "Page is not found. You've either entered invalid URL or don't have enough permissions to view this page.",
        )}
      </p>
      <p>
        <a onClick={goBack}>&lt; {translate('Back')}</a>
      </p>
    </div>
  );
};
