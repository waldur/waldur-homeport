import { ENV } from '@waldur/configs/default';
import { getSelectData } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import {
  getCategoryOptions,
  getCustomerList,
  getProjectList,
  getProviderOfferingsOptions,
  getPublicOfferingsOptions,
  getServiceProviderList,
  getUsers,
} from '@waldur/marketplace/common/api';

export const organizationAutocomplete = async (
  query: string,
  prevOptions,
  page,
  extraQueryParams?,
) => {
  const params = {
    name: query,
    page: page,
    page_size: ENV.pageSize,
    ...extraQueryParams,
  };
  const response = await getCustomerList(params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};

export const projectAutocomplete = async (
  customer: string,
  query: string,
  prevOptions,
  currentPage: number,
  extraParams: {} = {},
) => {
  const params = {
    name: query,
    customer,
    field: ['name', 'uuid', 'is_industry', 'customer_uuid'],
    o: 'name',
    page: currentPage,
    page_size: ENV.pageSize,
    ...extraParams,
  };
  const response = await getProjectList(params);
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

export const moveToProjectAutocomplete = async (
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const params = {
    name: query,
    field: ['name', 'url', 'customer_name'],
    o: 'customer_name',
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const response = await getProjectList(params);
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

export const providerAutocomplete = async (
  query: string,
  prevOptions,
  { page },
) => {
  const params = {
    name: query,
    field: ['customer_name', 'customer_uuid'],
    o: 'customer_name',
    page: page,
    page_size: ENV.pageSize,
  };
  const response = await getServiceProviderList(params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};

export const categoryAutocomplete = async (
  query: string,
  prevOptions,
  { page },
) => {
  const params = {
    title: query,
    field: ['title', 'uuid'],
    o: 'title',
    page: page,
    page_size: ENV.pageSize,
  };
  const response = await getCategoryOptions(params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};

export const offeringsAutocomplete = async (
  query: object,
  prevOptions,
  currentPage: number,
  providerOfferings = true,
  field = [
    'name',
    'uuid',
    'url',
    'category_title',
    'thumbnail',
    'customer_name',
  ],
) => {
  const params = {
    field,
    o: 'name',
    state: 'Active',
    ...query,
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const api = providerOfferings
    ? getProviderOfferingsOptions
    : getPublicOfferingsOptions;
  const response = await api(params);
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

export const userAutocomplete = async (
  query: string,
  prevOptions,
  { page },
) => {
  const params = {
    full_name: query,
    field: ['full_name', 'url', 'username', 'email'],
    o: ['full_name'],
    page: page,
    page_size: ENV.pageSize,
  };
  const response = await getUsers(params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};

export const resourceOfferingsAutocomplete = async (
  query: object,
  prevOptions,
  currentPage: number,
  category_uuid,
) => {
  const response = await getSelectData(
    `/marketplace-resource-offerings/${category_uuid}/`,
    {
      ...query,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  );
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};
