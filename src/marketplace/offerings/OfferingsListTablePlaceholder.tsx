import * as React from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table-react/ImageTablePlaceholder';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer, OuterState } from '@waldur/workspace/types';

// tslint:disable-next-line: no-var-requires
const TwoDocumentsIllustration: string = require('@waldur/images/table-placeholders/undraw_no_data_qbuo.svg');

const PureOfferingsListTablePlaceholder = ({ customer }: {customer: Customer}) => (
  <ImageTablePlaceholder
    illustration={TwoDocumentsIllustration}
    title={translate('Nothing to see here')}
    description={customer.is_service_provider ?
      translate('You can start filling this table by creating your first offering.') : null}
    action={
      customer.is_service_provider && (
        <Link
          state="marketplace-offering-create"
          className="btn btn-success btn-md">
          {translate('Add new offering')}
        </Link>
      )
    }
  />
);

export const OfferingsListTablePlaceholder = connect((state: OuterState) => ({
  customer: getCustomer(state),
}))(PureOfferingsListTablePlaceholder);
