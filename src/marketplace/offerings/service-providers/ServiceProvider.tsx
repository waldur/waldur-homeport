import { FunctionComponent, useMemo, useState } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import {
  Category,
  ServiceProvider as ServiceProviderType,
} from '@waldur/marketplace/types';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';

import { ServiceProviderHeroSection } from './ServiceProviderHeroSection';
import { ServiceProviderOfferingsGrid } from './ServiceProviderOfferingsGrid';
import { ServiceProviderPageBar } from './ServiceProviderPageBar';

import './ServiceProvider.scss';

interface ServiceProviderProps {
  serviceProvider: ServiceProviderType;
  refreshServiceProvider(): void;
}

export const ServiceProvider: FunctionComponent<ServiceProviderProps> = ({
  serviceProvider,
  refreshServiceProvider,
}) => {
  const [queryFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const {
    loading,
    error,
    value: categories,
  } = useAsync<Category[]>(
    () =>
      getCategories({
        params: {
          customer_uuid: serviceProvider.customer_uuid,
          has_offerings: true,
          has_shared: true,
        },
        ...ANONYMOUS_CONFIG,
      }),
    [serviceProvider],
  );

  const selectedCategory = useMemo(() => {
    if (categories && categories.length) {
      return categories.find((item) => item.uuid === categoryFilter);
    }
    return null;
  }, [categories, categoryFilter]);

  return (
    <div className="serviceProvider mb-3">
      <div className="serviceProvider-category-page">
        <ServiceProviderHeroSection
          category={selectedCategory}
          serviceProvider={serviceProvider}
          refreshServiceProvider={refreshServiceProvider}
        />

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <h3>{translate('Unable to load categories.')}</h3>
        ) : categories?.length ? (
          <ServiceProviderPageBar
            categories={categories}
            onCategoryChange={setCategoryFilter}
            categoryUuid={categoryFilter}
          />
        ) : null}

        <div className="container-xxl py-20">
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
