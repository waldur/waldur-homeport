import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  getContextFiltersForOfferings,
  getMarketplaceFilters,
} from '../landing/filter/store/selectors';

import { PublicOfferingsList } from './PublicOfferingsList';

export const CategoryGroupOfferingsList: FunctionComponent<{
  categoryGroup;
}> = ({ categoryGroup }) => {
  const filters = useSelector(getMarketplaceFilters);
  const filter = useMemo(
    () => ({
      ...getContextFiltersForOfferings(filters),
      category_group_uuid: categoryGroup.uuid,
    }),
    [categoryGroup, filters],
  );

  return <PublicOfferingsList showOrganization={false} filter={filter} />;
};
