import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { goBack } from '@/error/utils';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';

import { ErrorPageView } from './ErrorPageView';

export const ServerErrorPage: FunctionComponent = () => {
  useTitle(translate('Internal Server Error'));

  const reload = () => window.location.reload();

  return (
    <ErrorPageView code="500" hideActions>
      <div className="d-flex gap-3 justify-content-center">
        <BaseButton
          onClick={goBack}
          variant="secondary"
          label={translate('Go back')}
          size="lg"
        />
        <BaseButton
          onClick={reload}
          label={translate('Reload page')}
          variant="primary"
          size="lg"
        />
      </div>
    </ErrorPageView>
  );
};
