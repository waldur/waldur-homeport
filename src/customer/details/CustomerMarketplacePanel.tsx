import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';

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
      <Card className="mt-5">
        <Card.Header>
          <Card.Title>
            <h3>{translate('Service provider')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <ServiceProviderManagement />
        </Card.Body>
      </Card>
    );
  }
};
