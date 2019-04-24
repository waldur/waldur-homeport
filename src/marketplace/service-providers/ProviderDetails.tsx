import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getServiceProviderByCustomer, getProviderOfferings } from '@waldur/marketplace/common/api';
import { connectAngularComponent } from '@waldur/store/connect';

import { ProviderDetailsBody } from './ProviderDetailsBody';

async function loadData(customerId) {
  const provider = await getServiceProviderByCustomer({customer_uuid: customerId});
  const offerings = await getProviderOfferings(customerId);
  return {provider, offerings};
}

const CustomerDetailsContainer = () => (
  <Query variables={$state.params.customer_uuid} loader={loadData}>
    {({ loading, error, data }) => {
      if (loading) {
        return <LoadingSpinner/>;
      }
      if (error) {
        return <span>{translate('Unable to load service provider.')}</span>;
      }
      return (
        <ProviderDetailsBody {...data} />
      );
    }}
  </Query>
);

export default connectAngularComponent(CustomerDetailsContainer);
