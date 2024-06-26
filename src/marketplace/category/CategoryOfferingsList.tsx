import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  getContextFiltersForOfferings,
  getMarketplaceFilters,
} from '../landing/filter/store/selectors';

import { PublicOfferingsList } from './PublicOfferingsList';

export const CategoryOfferingsList: FunctionComponent<{
  category;
}> = ({ category }) => {
  const marketplaceFilters = useSelector(getMarketplaceFilters);
  const filter = useMemo(() => {
    const contextFilter =
      getContextFiltersForOfferings(marketplaceFilters) || {};
    return { category_uuid: category.uuid, ...contextFilter };
  }, [category, marketplaceFilters]);

  return <PublicOfferingsList filter={filter} showOrganization={false} />;
};
