import {
  identityProvidersList,
  MarketplaceResourcesListData,
} from 'waldur-js-client';

import { count, getAllPages } from '@/core/api';

export const getResourcesCount = (
  query?: MarketplaceResourcesListData['query'],
) => count('/api/marketplace-resources/', query);

export const getIdentityProviders = () =>
  getAllPages((page) => identityProvidersList({ query: { page } }));
