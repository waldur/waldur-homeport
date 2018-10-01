import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { withTranslation } from '@waldur/i18n/translate';

export const OfferingCreateButton = withTranslation(({ translate }) => (
  <Link
    state="marketplace-offering-create"
    className="btn btn-default btn-sm">
    <i className="fa fa-plus"/>
    {' '}
    {translate('Add offering')}
  </Link>
));
