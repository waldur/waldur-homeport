import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ServiceProvider } from '@waldur/marketplace/types';
import { BreadcrumbsContainer } from '@waldur/navigation/breadcrumbs/BreadcrumbsContainer';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import './ServiceProviderBreadcrumbs.scss';

const getBreadcrumbs = (serviceProvider: ServiceProvider): BreadcrumbItem[] => [
  {
    label: translate('Service providers'),
    state: 'marketplace-service-providers.details',
  },
  {
    label:
      serviceProvider.customer_abbreviation || serviceProvider.customer_name,
  },
];

interface ServiceProviderBreadcrumbsProps {
  serviceProvider: ServiceProvider;
}

export const ServiceProviderBreadcrumbs: FunctionComponent<ServiceProviderBreadcrumbsProps> = ({
  serviceProvider,
}) => {
  useBreadcrumbsFn(
    () => (serviceProvider ? getBreadcrumbs(serviceProvider) : []),
    [serviceProvider],
  );
  return serviceProvider ? (
    <div className="serviceProviderBreadcrumbsContainer">
      <BreadcrumbsContainer />
    </div>
  ) : null;
};
