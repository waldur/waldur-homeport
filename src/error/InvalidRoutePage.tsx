import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';

import { ErrorPageView } from './ErrorPageView';

export const InvalidRoutePage: FunctionComponent = () => {
  useTitle(translate('Object is not found.'));
  return (
    <ErrorPageView
      code="404"
      altTitle={translate('Page is not found')}
      altDescription={translate(
        "You've either entered invalid URL or trying to reach disabled feature.",
      )}
    />
  );
};
