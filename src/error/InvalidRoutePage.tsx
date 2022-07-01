import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { goBack } from '@waldur/navigation/utils';

export const InvalidRoutePage: FunctionComponent = () => {
  useTitle(translate('Object is not found.'));
  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-column flex-center flex-column-fluid p-10">
        <img src={require('./404.png')} className="mw-100 mb-10 h-lg-450px" />
        <h1 className="fw-bold mb-10">
          {translate(
            "Page is not found. You've either entered invalid URL or trying to reach disabled feature.",
          )}
        </h1>
        <a onClick={goBack} className="btn btn-primary">
          {translate('Back')}
        </a>
      </div>
    </div>
  );
};
