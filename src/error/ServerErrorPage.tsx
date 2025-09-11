import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { goBack } from '@waldur/error/utils';
import { translate } from '@waldur/i18n';
import Illustration from '@waldur/images/table-placeholders/undraw_fixing_bugs_w7gi.svg';
import { useTitle } from '@waldur/navigation/title';

export const ServerErrorPage: FunctionComponent = () => {
  useTitle(translate('Internal Server Error'));

  const reload = () => window.location.reload();

  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-column flex-center flex-column-fluid p-10 text-center">
        <Illustration className="mw-100 mb-10 h-lg-450px" />

        <h1 className="fw-bold mb-5">
          {translate('Oops! Something went wrong on our side.')}
        </h1>

        <p className="fs-6 text-gray-700 mb-10">
          {translate(
            "We're sorry for the inconvenience. Our technical team has been automatically notified and is working to fix the issue. Please try again in a few moments.",
          )}
        </p>

        <div className="d-flex gap-3 justify-content-center">
          <Button onClick={goBack} variant="secondary">
            {translate('Go back')}
          </Button>
          <Button onClick={reload}>{translate('Reload page')}</Button>
        </div>
      </div>
    </div>
  );
};
