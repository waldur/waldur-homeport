import {
  LexisLinksListData,
  marketplaceCategoriesList,
  marketplaceCategoryGroupsList,
  MarketplaceCategoryGroupsListData,
  MarketplaceOrdersListData,
  MarketplaceRobotAccountsListData,
  marketplaceServiceProvidersList,
  MarketplaceServiceProvidersListData,
} from 'waldur-js-client';

import { getAllPages, count } from '@/core/api';
import { ServiceProvider } from '@/marketplace/types';

export const getCategoryGroups = (
  query?: MarketplaceCategoryGroupsListData['query'],
) =>
  getAllPages((page) =>
    marketplaceCategoryGroupsList({ query: { page, ...query } }),
  );

export const getCategories = () =>
  getAllPages((page) => marketplaceCategoriesList({ query: { page } }));

export const getServiceProviderByCustomer = async (
  query: MarketplaceServiceProvidersListData['query'],
) => {
  const response = await marketplaceServiceProvidersList({ query });
  return (response.data[0] as ServiceProvider) ?? null;
};

export const countOrders = (query?: MarketplaceOrdersListData['query']) =>
  count('/api/marketplace-orders/', query);

export const countRobotAccounts = (
  query: MarketplaceRobotAccountsListData['query'],
) => count('/api/marketplace-robot-accounts/', query);

export const countLexisLinks = (query?: LexisLinksListData['query']) =>
  count('/api/lexis-links/', query);
