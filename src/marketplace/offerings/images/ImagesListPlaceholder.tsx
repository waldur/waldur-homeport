import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

export const ImagesListPlaceholder: FunctionComponent = () => (
  <div className="justify-content-center row" style={{ clear: 'both' }}>
    <div className="col-sm-4">
      <div className="text-center">
        <h4>{translate("Offering doesn't have images.")}</h4>
        <p>
          {translate('Please provide visual material describing the Offering')}
        </p>
      </div>
    </div>
  </div>
);
