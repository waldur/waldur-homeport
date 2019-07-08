import { getList } from '@waldur/core/api';

export const fetchTenantOptions = ({ customerId }) =>
  getList('/openstack-tenants/', {
    field: ['name', 'backend_id'],
    customer_uuid: customerId,
  })
  .then(options => ({
    options: options.map(tenantSerializer),
  }));

const tenantSerializer = ({ name, backend_id }) => ({
  name,
  value: `Tenant UUID: ${backend_id}. Name: ${name}`,
});

export const fetchInstanceOptions = ({ customerId }) =>
  getList('/openstacktenant-instances/', {
    field: ['name', 'backend_id'],
    customer_uuid: customerId,
  })
  .then(options => ({
    options: options.map(instanceSerializer),
  }));

const instanceSerializer = ({ name, backend_id }) => ({
  name,
  value: `Instance UUID: ${backend_id}. Name: ${name}`,
});
