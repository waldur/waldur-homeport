import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { CreateOfferingForProviderButton } from '@/marketplace/offerings/list/CreateOfferingButton';
import { useTitle } from '@/navigation/title';

import { CardStyleType } from '../common/cards/index';
import { CardStyleProvider } from '../landing/CardStyleContext';
import { MarketplaceScopeBar } from '../landing/filter/PageBarFilters';
import {
  getContextFiltersForOfferings,
  getMarketplaceFilters,
} from '../landing/filter/store/selectors';
import { useMarketplacePublicTabs } from '../utils';

import { PublicOfferingsList } from './PublicOfferingsList';

export const AllOfferingsList = () => {
  const {
    params: { initialMode },
  } = useCurrentStateAndParams();
  useTitle(translate('Offerings'));
  useMarketplacePublicTabs();

  const cardStyle: CardStyleType =
    (ENV.plugins.WALDUR_CORE.MARKETPLACE_CARD_STYLE as CardStyleType) ||
    'detailed';

  const filters = useSelector(getMarketplaceFilters);
  const contextFilter = useMemo(
    () => getContextFiltersForOfferings(filters),
    [filters],
  );

  // The organization the page is filtered by, which Add offering opens on.
  const organizationUuid = filters.find((item) => item.name === 'organization')
    ?.value?.uuid;

  return (
    <CardStyleProvider cardStyle={cardStyle}>
      <MarketplaceScopeBar />
      <PublicOfferingsList
        showCategory
        showOrganization
        initialMode={initialMode}
        filter={contextFilter}
        tableActions={
          <CreateOfferingForProviderButton providerUuid={organizationUuid} />
        }
      />
    </CardStyleProvider>
  );
};
