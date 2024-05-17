import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { goBack } from '@waldur/navigation/utils';

import Image from './404.png';

export const InvalidRoutePage: FunctionComponent = () => {
  useTitle(translate('Object is not found.'));
  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-column flex-center flex-column-fluid p-10">
        <img src={Image} className="mw-100 mb-10 h-lg-450px" alt="not found" />
        <h1 className="fw-bold mb-10">
          {translate(
            "Page is not found. You've either entered invalid URL or trying to reach disabled feature.",
          )}
        </h1>
        <Button onClick={goBack}>{translate('Back')}</Button>
      </div>
    </div>
  );
};
