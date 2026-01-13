import { FunctionComponent } from 'react';

import { goBack } from '@waldur/error/utils';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { ErrorPageView } from './ErrorPageView';

export const ServerErrorPage: FunctionComponent = () => {
  useTitle(translate('Internal Server Error'));

  const reload = () => window.location.reload();

  return (
    <ErrorPageView code="500" hideActions>
      <div className="d-flex gap-3 justify-content-center">
        <SubmitButton
          submitting={false}
          onClick={goBack}
          variant="secondary"
          type="button"
        >
          {translate('Go back')}
        </SubmitButton>
        <SubmitButton submitting={false} onClick={reload} type="button">
          {translate('Reload page')}
        </SubmitButton>
      </div>
    </ErrorPageView>
  );
};
