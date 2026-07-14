import {
  identityProvidersList,
  marketplaceResourcesCount,
  MarketplaceResourcesListData,
} from 'waldur-js-client';

import { fetchResultCount, getAllPages } from '@/core/api';

export const getResourcesCount = (
  query?: MarketplaceResourcesListData['query'],
) => marketplaceResourcesCount({ query }).then(fetchResultCount);

export const getIdentityProviders = () =>
  getAllPages((page) => identityProvidersList({ query: { page } }));
