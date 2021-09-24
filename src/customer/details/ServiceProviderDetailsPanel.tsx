import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { CustomerAccordion } from '@waldur/customer/details/CustomerAccordion';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

export const ServiceProviderDetailsPanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  // eslint-disable-next-line no-console
  console.log('customer', customer); // fixme customer.description is missing
  return customer.is_service_provider ? (
    <CustomerAccordion
      title={translate('Service provider details')}
      subtitle={translate('Update you service provider profile')}
    >
      <p>customer description</p>
    </CustomerAccordion>
  ) : null;
};
