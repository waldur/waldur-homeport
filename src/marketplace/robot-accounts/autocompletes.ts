import { ENV } from '@waldur/configs/default';
import { getSelectData } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { Customer, Project } from '@waldur/workspace/types';

const getProviderProjectList = ({ provider_uuid, ...params }) =>
  getSelectData<Project>(
    `/marketplace-service-providers/${provider_uuid}/robot_account_projects`,
    params,
  );

export const providerProjectAutocomplete = async (
  provider_uuid: string,
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const params = {
    project_name: query,
    provider_uuid,
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const response = await getProviderProjectList(params);
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

const getProviderCustomerList = ({ provider_uuid, ...params }) =>
  getSelectData<Customer>(
    `/marketplace-service-providers/${provider_uuid}/robot_account_customers`,
    params,
  );

export const providerCustomerAutocomplete = async (
  provider_uuid: string,
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const params = {
    customer_name: query,
    provider_uuid,
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const response = await getProviderCustomerList(params);
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};
