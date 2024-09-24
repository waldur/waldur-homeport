import { ENV } from '@waldur/configs/default';
import { get, getSelectData } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';

import { SupportStatistics } from './types';

const tenantSerializer = ({ name, backend_id, project_name }) => ({
  name: `${project_name} / ${name}`,
  value: `Tenant UUID: ${backend_id}. Name: ${name}`,
});

export const fetchTenantOptions = async (
  query,
  prevOptions,
  currentPage: number,
  customerId,
) => {
  let response = await getSelectData('/openstack-tenants/', {
    field: ['name', 'backend_id', 'project_name'],
    customer_uuid: customerId,
    name: query,
    o: ['project_name', 'name'],
    page: currentPage,
    page_size: ENV.pageSize,
  });
  response = {
    ...response,
    options: response.options.map(tenantSerializer),
  };
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

const instanceSerializer = ({ name, backend_id, project_name }) => ({
  name: `${project_name} / ${name}`,
  value: `Instance UUID: ${backend_id}. Name: ${name}`,
});

export const fetchInstanceOptions = async (
  query,
  prevOptions,
  currentPage: number,
  customerId,
) => {
  let response = await getSelectData('/openstack-instances/', {
    field: ['name', 'backend_id', 'project_name'],
    customer_uuid: customerId,
    name: query,
    o: ['project_name', 'name'],
    page: currentPage,
    page_size: ENV.pageSize,
  });
  response = {
    ...response,
    options: response.options.map(instanceSerializer),
  };
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

export const getSupportStatistics = () =>
  get<SupportStatistics>(`/support-statistics/`).then(
    (response) => response.data,
  );
