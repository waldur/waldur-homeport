import { getAll, getById } from '@waldur/core/api';
import { Customer } from '@waldur/customer/types';
import { Project } from '@waldur/workspace/types';

import { Offering, OfferingTemplate } from './types';

const tenantSerializer = ({ name, backend_id, project_name }) => ({
  name: `${project_name} / ${name}`,
  value: `Tenant UUID: ${backend_id}. Name: ${name}`,
});

export const fetchTenantOptions = (query, customerId) =>
  getAll('/openstack-tenants/', {
    params: {
      field: ['name', 'backend_id', 'project_name'],
      customer_uuid: customerId,
      name: query,
      o: ['project_name', 'name'],
    },
  }).then(options => ({
    options: options.map(tenantSerializer),
  }));

const instanceSerializer = ({ name, backend_id, project_name }) => ({
  name: `${project_name} / ${name}`,
  value: `Instance UUID: ${backend_id}. Name: ${name}`,
});

export const fetchInstanceOptions = (query, customerId) =>
  getAll('/openstacktenant-instances/', {
    params: {
      field: ['name', 'backend_id', 'project_name'],
      customer_uuid: customerId,
      name: query,
      o: ['project_name', 'name'],
    },
  }).then(options => ({
    options: options.map(instanceSerializer),
  }));

export const getOffering = uuid =>
  getById<Offering>('/support-offerings/', uuid);

export const getOfferingTemplate = uuid =>
  getById<OfferingTemplate>('/support-offering-templates/', uuid);

export const getProject = uuid => getById<Project>('/projects/', uuid);

export const getCustomer = uuid => getById<Customer>('/customers/', uuid);
