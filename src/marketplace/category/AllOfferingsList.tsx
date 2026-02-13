import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { useExtraToolbar, useToolbarActions } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { PageBarFilters } from '../landing/filter/PageBarFilters';
import {
  getContextFiltersForOfferings,
  getMarketplaceFilters,
} from '../landing/filter/store/selectors';
import { MarketplaceLandingFilter } from '../landing/MarketplaceLandingFilter';
import { useMarketplacePublicTabs } from '../utils';

import { PublicOfferingsList } from './PublicOfferingsList';

export const AllOfferingsList = () => {
  const {
    params: { initialMode },
  } = useCurrentStateAndParams();
  useTitle(translate('Offerings'));
  useMarketplacePublicTabs();
  const filters = useSelector(getMarketplaceFilters);
  useToolbarActions(<MarketplaceLandingFilter />);
  useExtraToolbar(filters.length ? <PageBarFilters /> : null, [filters]);
  const contextFilter = useMemo(
    () => getContextFiltersForOfferings(filters),
    [filters],
  );

  return (
    <PublicOfferingsList
      showCategory
      showOrganization
      initialMode={initialMode}
      filter={contextFilter}
    />
  );
};
