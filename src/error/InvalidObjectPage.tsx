import { FunctionComponent } from 'react';

import { goBack } from '@waldur/error/utils';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import Illustration from '@waldur/images/table-placeholders/undraw_empty_xct9.svg';
import { useTitle } from '@waldur/navigation/title';

export const InvalidObjectPage: FunctionComponent = () => {
  useTitle(translate('Page is not found.'));
  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-column flex-center flex-column-fluid p-10">
        <Illustration className="mw-100 mb-10 h-lg-450px" />
        <h1 className="fw-bold mb-10">
          {translate(
            "You've either entered invalid URL or don't have enough permissions to view this page.",
          )}
        </h1>
        <SubmitButton
          submitting={false}
          type="button"
          onClick={goBack}
          label={translate('Back')}
        />
      </div>
    </div>
  );
};
