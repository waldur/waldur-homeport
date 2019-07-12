import { getAll } from '@waldur/core/api';

export const fetchTenantOptions = (query, customerId) =>
  getAll('/openstack-tenants/', {params: {
    field: ['name', 'backend_id', 'project_name'],
    customer_uuid: customerId,
    name: query,
    o: ['project_name', 'name'],
  }})
  .then(options => ({
    options: options.map(tenantSerializer),
  }));

const tenantSerializer = ({ name, backend_id, project_name }) => ({
  name: `${project_name} / ${name}`,
  value: `Tenant UUID: ${backend_id}. Name: ${name}`,
});

export const fetchInstanceOptions = (query, customerId) =>
  getAll('/openstacktenant-instances/', {params: {
    field: ['name', 'backend_id', 'project_name'],
    customer_uuid: customerId,
    name: query,
    o: ['project_name', 'name'],
  }})
  .then(options => ({
    options: options.map(instanceSerializer),
  }));

const instanceSerializer = ({ name, backend_id, project_name }) => ({
  name: `${project_name} / ${name}`,
  value: `Instance UUID: ${backend_id}. Name: ${name}`,
});
