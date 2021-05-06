import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ServiceProviderManagement } from '@waldur/marketplace/service-providers/ServiceProviderManagement';
import { getCustomer } from '@waldur/workspace/selectors';

export const CustomerMarketplacePanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  return (
    <div className="highlight">
      <h3>{translate('Marketplace service provider')}</h3>
      {!customer.is_service_provider && (
        <p>
          {translate(
            'You can register organization as a marketplace service provider by pressing the button below',
          )}
        </p>
      )}
      <ServiceProviderManagement />
    </div>
  );
};
