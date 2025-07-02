import {
  customersList,
  marketplaceCategoriesList,
  marketplaceProviderOfferingsList,
  MarketplaceProviderOfferingsListData,
  marketplacePublicOfferingsList,
  MarketplacePublicOfferingsListData,
  marketplaceResourceOfferingsList,
  MarketplaceResourceOfferingsListData,
  marketplaceResourcesList,
  MarketplaceResourcesListData,
  marketplaceServiceProvidersList,
  projectsList,
  ProjectsListData,
  usersList,
} from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';

export const organizationAutocomplete = async (
  query: string,
  prevOptions,
  page,
  extraQueryParams?,
) => {
  const response = await customersList({
    query: {
      query,
      page: page,
      page_size: ENV.pageSize,
      ...extraQueryParams,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    page,
  );
};

export const projectAutocomplete = async (
  customer: string,
  query: string,
  prevOptions,
  currentPage: number,
  extraParams: ProjectsListData['query'] = {},
) => {
  const response = await projectsList({
    query: {
      name: query,
      customer: [customer],
      field: ['name', 'uuid', 'url', 'is_industry', 'customer_uuid'],
      o: ['name'],
      page: currentPage,
      page_size: ENV.pageSize,
      ...extraParams,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

export const moveToProjectAutocomplete = async (
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const response = await projectsList({
    query: {
      name: query,
      field: ['name', 'url', 'customer_name'],
      o: ['customer_name'],
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

export const providerAutocomplete = async (
  query: string,
  prevOptions,
  { page },
) => {
  const response = await marketplaceServiceProvidersList({
    query: {
      customer_keyword: query,
      field: ['customer_name', 'customer_uuid', 'url', 'uuid'],
      o: ['customer_name'],
      page: page,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    page,
  );
};

export const categoryAutocomplete = async (
  query: string,
  prevOptions,
  { page },
  extraParams?,
) => {
  const response = await marketplaceCategoriesList({
    query: {
      title: query,
      field: ['title', 'uuid', 'url'],
      o: 'title',
      page: page,
      page_size: ENV.pageSize,
      ...extraParams,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    page,
  );
};

export const OfferingsAutocompleteCommonFields = [
  'name',
  'uuid',
  'url',
  'category_title',
  'thumbnail',
  'customer_name',
  'customer_uuid',
] as any[];

export const providerOfferingsAutocomplete = async (
  query: string | MarketplaceProviderOfferingsListData['query'],
  prevOptions,
  currentPage: number,
  field: MarketplaceProviderOfferingsListData['query']['field'] = OfferingsAutocompleteCommonFields,
) => {
  const queryObject = typeof query === 'string' ? { name: query } : query;
  const response = await marketplaceProviderOfferingsList({
    query: {
      field,
      o: ['name'],
      state: ['Active'],
      ...queryObject,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

export const publicOfferingsAutocomplete = async (
  query: string | MarketplacePublicOfferingsListData['query'],
  prevOptions,
  currentPage: number,
  field: MarketplacePublicOfferingsListData['query']['field'] = OfferingsAutocompleteCommonFields,
) => {
  const queryObject = typeof query === 'string' ? { name: query } : query;
  const response = await marketplacePublicOfferingsList({
    query: {
      field,
      o: ['name'],
      state: ['Active'],
      ...queryObject,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

export const userAutocomplete = async (
  query: string,
  prevOptions,
  { page },
) => {
  const response = await usersList({
    query: {
      full_name: query,
      field: ['full_name', 'url', 'username', 'email', 'uuid'],
      o: ['full_name'],
      page: page,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    page,
  );
};

export const resourceOfferingsAutocomplete = async (
  query: MarketplaceResourceOfferingsListData['query'],
  prevOptions,
  currentPage: number,
  category_uuid,
) => {
  const response = await marketplaceResourceOfferingsList({
    path: { category_uuid: category_uuid },
    query: {
      ...query,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

export const resourceAutocomplete = async (
  query: MarketplaceResourcesListData['query'],
  prevOptions,
  currentPage: number,
) => {
  const response = await marketplaceResourcesList({
    query: {
      ...query,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};
