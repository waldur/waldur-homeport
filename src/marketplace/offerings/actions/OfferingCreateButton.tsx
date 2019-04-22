import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const OfferingCreateButton = () => (
  <Link
    state="marketplace-offering-create"
    className="btn btn-default btn-sm">
    <i className="fa fa-plus"/>
    {' '}
    {translate('Add offering')}
  </Link>
);
