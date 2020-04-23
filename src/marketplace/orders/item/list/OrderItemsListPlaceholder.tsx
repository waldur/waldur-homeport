import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table-react/ImageTablePlaceholder';

const DocumentSearchIllustration = require('@waldur/images/table-placeholders/undraw_file_searching_duff.svg');

export const OrderItemslistTablePlaceholder = () => (
  <ImageTablePlaceholder
    illustration={DocumentSearchIllustration}
    title={translate(`Seems there's nothing here`)}
    description={translate(
      `You can find offerings to order in the marketplace`,
    )}
    action={
      <Link
        state="marketplace-landing-customer"
        className="btn btn-success btn-md"
      >
        {translate('Go to marketplace')}
      </Link>
    }
  />
);
