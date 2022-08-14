import { FunctionComponent, useState } from 'react';

import { ServiceProvider as ServiceProviderType } from '@waldur/marketplace/types';

import { ServiceProviderHeader } from './ServiceProviderHeader';
import { ServiceProviderOfferingsCategoriesFilter } from './ServiceProviderOfferingsCategoriesFilter';
import { ServiceProviderOfferingsFilterBar } from './ServiceProviderOfferingsFilterBar';
import { ServiceProviderOfferingsGrid } from './ServiceProviderOfferingsGrid';
import './ServiceProvider.scss';

interface ServiceProviderProps {
  serviceProvider: ServiceProviderType;
  refreshServiceProvider(): void;
}

export const ServiceProvider: FunctionComponent<ServiceProviderProps> = ({
  serviceProvider,
  refreshServiceProvider,
}) => {
  const [queryFilter, setQueryFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  return (
    <div className="serviceProvider mb-3">
      <ServiceProviderHeader
        serviceProvider={serviceProvider}
        refreshServiceProvider={refreshServiceProvider}
      />
      <div className="serviceProvider__content">
        <ServiceProviderOfferingsCategoriesFilter
          serviceProviderUuid={serviceProvider.customer_uuid}
          onQueryFilterChange={setQueryFilter}
          onCategoryChange={setCategoryFilter}
        />
        <div className="serviceProvider__grid">
          {categoryFilter && (
            <ServiceProviderOfferingsFilterBar categoryUuid={categoryFilter} />
          )}
          <ServiceProviderOfferingsGrid
            serviceProviderUuid={serviceProvider.customer_uuid}
            query={queryFilter}
            categoryUuid={categoryFilter}
          />
        </div>
      </div>
    </div>
  );
};
