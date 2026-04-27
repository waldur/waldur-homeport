import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';

import { ErrorPageView } from './ErrorPageView';

export const AccessDeniedPage: FunctionComponent = () => {
  useTitle(translate('Access denied'));
  return (
    <ErrorPageView
      code="403"
      altTitle={translate('Oops... Access to this page is denied.')}
      altDescription={translate(
        "You don't have enough permissions to view this page.",
      )}
    />
  );
};
