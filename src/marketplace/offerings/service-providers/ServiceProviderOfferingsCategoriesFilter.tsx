import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';
import './ServiceProviderOfferingsCategoriesFilter.scss';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { CategoriesList } from '@waldur/marketplace/offerings/service-providers/CategoriesList';
import { ServiceProviderOfferingsQueryFilter } from '@waldur/marketplace/offerings/service-providers/ServiceProviderOfferingsQueryFilter';
import { Category } from '@waldur/marketplace/types';

interface ServiceProviderOfferingsCategoriesFilterProps {
  serviceProviderUuid: string;
  onQueryFilterChange: (query: string) => void;
  onCategoryChange: (newCategory: string) => void;
}

export const ServiceProviderOfferingsCategoriesFilter: FunctionComponent<ServiceProviderOfferingsCategoriesFilterProps> = ({
  serviceProviderUuid,
  onQueryFilterChange,
  onCategoryChange,
}) => {
  const { loading, error, value } = useAsync<Category[]>(
    () =>
      getCategories({
        params: {
          customer_uuid: serviceProviderUuid, // fixme WAL-4280
        },
      }),
    [serviceProviderUuid],
  );
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load categories.')}</h3>
  ) : (
    <div className="offeringsCategoriesFilter">
      <ServiceProviderOfferingsQueryFilter
        onQueryChange={onQueryFilterChange}
      />
      <CategoriesList categories={value} onCategoryChange={onCategoryChange} />
    </div>
  );
};
