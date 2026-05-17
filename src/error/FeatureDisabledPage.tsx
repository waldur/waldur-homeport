import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';

import { ErrorPageView } from './ErrorPageView';

export const FeatureDisabledPage: FunctionComponent = () => {
  useTitle(translate('Feature is disabled.'));
  return (
    <ErrorPageView
      code="404"
      altTitle={translate('This feature is disabled')}
      altDescription={translate(
        'The page you are trying to reach belongs to a feature that is not enabled in this deployment. Contact an administrator to enable it.',
      )}
    />
  );
};
