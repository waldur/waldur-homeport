import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { goBack } from '@waldur/navigation/utils';

const Illustration = require('@waldur/images/table-placeholders/undraw_empty_xct9.svg');

export const InvalidObjectPage: FunctionComponent = () => {
  useTitle(translate('Page is not found.'));
  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-column flex-center flex-column-fluid p-10">
        <img src={Illustration} className="mw-100 mb-10 h-lg-450px" />
        <h1 className="fw-bold mb-10">
          {translate(
            `You've either entered invalid URL or don't have enough permissions to view this page.`,
          )}
        </h1>
        <Button onClick={goBack}>{translate('Back')}</Button>
      </div>
    </div>
  );
};
