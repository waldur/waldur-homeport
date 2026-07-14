import {
  LexisLinksListData,
  lexisLinksCount,
  marketplaceCategoriesList,
  marketplaceCategoryGroupsList,
  MarketplaceCategoryGroupsListData,
  marketplaceOrdersCount,
  MarketplaceOrdersListData,
  marketplaceRobotAccountsCount,
  MarketplaceRobotAccountsListData,
  marketplaceServiceProvidersList,
  MarketplaceServiceProvidersListData,
  ServiceProvider,
} from 'waldur-js-client';

import { fetchResultCount, getAllPages } from '@/core/api';

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
  marketplaceOrdersCount({ query }).then(fetchResultCount);

export const countRobotAccounts = (
  query: MarketplaceRobotAccountsListData['query'],
) => marketplaceRobotAccountsCount({ query }).then(fetchResultCount);

export const countLexisLinks = (query?: LexisLinksListData['query']) =>
  lexisLinksCount({ query }).then(fetchResultCount);
