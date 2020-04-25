import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { translate } from '@waldur/i18n';
import { ResourceExpandableRow } from '@waldur/resource/ResourceExpandableRow';

import { loadCustomerResources } from './api';
import { CustomerPaymentProfile } from './CustomerPaymentProfile';

export const CustomerExpandableRow = props => (
  <Query loader={loadCustomerResources} variables={props.row}>
    {({ loading, error, data }) => {
      if (loading) {
        return <LoadingSpinner />;
      } else if (error) {
        return (
          <span>{translate('Unable to load organization resources.')}</span>
        );
      } else {
        return (
          <React.Fragment>
            <ResourceExpandableRow rows={data} />
            <CustomerPaymentProfile
              paymentProfiles={props.row.payment_profiles}
            />
          </React.Fragment>
        );
      }
    }}
  </Query>
);
