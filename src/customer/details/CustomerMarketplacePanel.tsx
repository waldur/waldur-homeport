import * as React from 'react';

import { translate } from '@waldur/i18n';
import { ServiceProviderManagement } from '@waldur/marketplace/service-providers/ServiceProviderManagement';

export const CustomerMarketplacePanel = () => (
  <div className="highlight">
    <h3>{translate('Marketplace service provider')}</h3>
    <p>
      {translate(
        'You can register organization as a marketplace service provider by pressing the button below',
      )}
    </p>
    <ServiceProviderManagement />
  </div>
);
