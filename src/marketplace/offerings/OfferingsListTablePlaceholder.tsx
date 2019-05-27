import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { TablePlaceholder } from '@waldur/table-react/placeholder/TablePlaceholder';

// tslint:disable-next-line: no-var-requires
const TwoDocumentsIllustration: string = require('@waldur/images/table-placeholders/undraw_no_data_qbuo.svg');

export const OfferingsListTablePlaceholder = () => {
  return (
    <TablePlaceholder illustration={TwoDocumentsIllustration}>
      <div className="text-center">
        <h2>{translate('Nothing to see here')}</h2>
        <p>{translate('You can start filling this table by creating your first offering.')}</p>
        <Link state="marketplace-offering-create" className="btn btn-success btn-md">
          {translate('Add new offering')}
        </Link>
      </div>
    </TablePlaceholder>
  );
};
