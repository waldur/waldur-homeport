import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useExtraToolbar, useToolbarActions } from '@waldur/navigation/context';

import { PageBarFilters } from '../landing/filter/PageBarFilters';
import {
  getContextFiltersForOfferings,
  getMarketplaceFilters,
} from '../landing/filter/store/selectors';
import { MarketplaceLandingFilter } from '../landing/MarketplaceLandingFilter';

import { PublicOfferingsList } from './PublicOfferingsList';

export const CategoryGroupOfferingsList: FunctionComponent<{
  categoryGroup;
}> = ({ categoryGroup }) => {
  const filters = useSelector(getMarketplaceFilters);
  useToolbarActions(<MarketplaceLandingFilter />);
  useExtraToolbar(filters.length ? <PageBarFilters /> : null, [filters]);
  const filter = useMemo(
    () => ({
      ...(getContextFiltersForOfferings(filters) || {}),
      category_group_uuid: categoryGroup.uuid,
    }),
    [categoryGroup],
  );

  return <PublicOfferingsList showOrganization={false} filter={filter} />;
};
