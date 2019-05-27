import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { TablePlaceholder } from '@waldur/table-react/placeholder/TablePlaceholder';

// tslint:disable-next-line: no-var-requires
const DocumentSearchIllustration = require('@waldur/images/table-placeholders/undraw_file_searching_duff.svg');

export const OrderItemslistTablePlaceholder = () => {
  return (
    <TablePlaceholder illustration={DocumentSearchIllustration}>
      <div className="text-center">
        <h2>{translate(`Seems there's nothing here`)}</h2>
        <p>{translate(`You can find offerings to order in the marketplace`)}</p>
        <Link state="marketplace-landing-customer" className="btn btn-success btn-md">
          {translate('Go to marketplace')}
        </Link>
      </div>
    </TablePlaceholder>
  );
};
