import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';

import { ErrorPageView } from './ErrorPageView';

export const InvalidRoutePage: FunctionComponent = () => {
  const title = translate('Page is not found');
  useTitle(title);
  return (
    <ErrorPageView
      code="404"
      altTitle={title}
      altDescription={translate(
        'The URL may be incorrect, or the feature may be disabled.',
      )}
    />
  );
};
