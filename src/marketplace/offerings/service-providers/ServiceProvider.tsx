import { FunctionComponent, useState } from 'react';

import { ServiceProviderBreadcrumbs } from '@waldur/marketplace/offerings/service-providers/ServiceProviderBreadcrumbs';
import { ServiceProviderHeader } from '@waldur/marketplace/offerings/service-providers/ServiceProviderHeader';
import { ServiceProviderOfferingsCategoriesFilter } from '@waldur/marketplace/offerings/service-providers/ServiceProviderOfferingsCategoriesFilter';
import { ServiceProviderOfferingsFilterBar } from '@waldur/marketplace/offerings/service-providers/ServiceProviderOfferingsFilterBar';
import { ServiceProviderOfferingsGrid } from '@waldur/marketplace/offerings/service-providers/ServiceProviderOfferingsGrid';
import { ServiceProvider as ServiceProviderType } from '@waldur/marketplace/types';
import './ServiceProvider.scss';

interface ServiceProviderProps {
  serviceProvider: ServiceProviderType;
}

export const ServiceProvider: FunctionComponent<ServiceProviderProps> = ({
  serviceProvider,
}) => {
  const [queryFilter, setQueryFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  return (
    <div className="serviceProvider">
      <ServiceProviderHeader serviceProvider={serviceProvider} />
      <ServiceProviderBreadcrumbs serviceProvider={serviceProvider} />
      <div className="serviceProvider__content">
        <ServiceProviderOfferingsCategoriesFilter
          serviceProviderUuid={serviceProvider.customer_uuid}
          onQueryFilterChange={(q: string) => setQueryFilter(q)}
          onCategoryChange={(newCategory: string) =>
            setCategoryFilter(newCategory)
          }
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
