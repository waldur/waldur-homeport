import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { canRegisterServiceProviderForCustomer } from '@waldur/marketplace/service-providers/selectors';
import { ServiceProviderManagement } from '@waldur/marketplace/service-providers/ServiceProviderManagement';
import { getCustomer } from '@waldur/workspace/selectors';

export const CustomerMarketplacePanel: FunctionComponent<{}> = () => {
  const customer = useSelector(getCustomer);
  const canRegisterServiceProvider = useSelector(
    canRegisterServiceProviderForCustomer,
  );
  if (!customer.is_service_provider && !canRegisterServiceProvider) {
    return null;
  } else {
    return (
      <FormTable.Card
        title={translate('Service provider')}
        className="card-bordered"
      >
        <ServiceProviderManagement />
      </FormTable.Card>
    );
  }
};
