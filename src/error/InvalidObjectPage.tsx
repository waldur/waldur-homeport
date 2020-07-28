import * as React from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { goBack } from '@waldur/navigation/utils';

export const InvalidObjectPage = () => {
  useTitle(translate('Page is not found.'));
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
