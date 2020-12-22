import { ENV } from '@waldur/configs/default';
import { getById, getSelectData, post, put } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { Customer } from '@waldur/customer/types';
import { Project } from '@waldur/workspace/types';

import { Offering, OfferingTemplate } from './types';

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
  let response = await getSelectData('/openstacktenant-instances/', {
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

export const getOffering = (uuid) =>
  getById<Offering>('/support-offerings/', uuid);

export const getOfferingTemplate = (uuid) =>
  getById<OfferingTemplate>('/support-offering-templates/', uuid);

export const getProject = (uuid) => getById<Project>('/projects/', uuid);

export const getCustomer = (uuid) => getById<Customer>('/customers/', uuid);

export const setBackendID = (
  resourceUuid: string,
  formData: { backend_id: string },
) => post(`/support-offerings/${resourceUuid}/set_backend_id/`, formData);

export const updateOffering = (id, data) =>
  put(`/support-offerings/${id}/`, data);
