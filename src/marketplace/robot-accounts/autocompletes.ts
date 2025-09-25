import {
  marketplaceServiceProvidersRobotAccountCustomersList,
  marketplaceServiceProvidersRobotAccountProjectsList,
} from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';

export const providerProjectAutocomplete = async (
  provider_uuid: string,
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const response = await marketplaceServiceProvidersRobotAccountProjectsList({
    path: { uuid: provider_uuid },
    query: {
      project_name: query,
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

export const providerCustomerAutocomplete = async (
  provider_uuid: string,
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const response = await marketplaceServiceProvidersRobotAccountCustomersList({
    path: { uuid: provider_uuid },
    query: {
      customer_name: query,
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
