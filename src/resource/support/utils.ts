import { createFetcher } from '@waldur/table-react';

const baseFetcher = createFetcher('openstack-shared-settings-customers');

const getVmCount = customer => {
  const quota = customer.quotas.find(item => item.name === 'nc_vm_count');
  if (quota) {
    return quota.usage;
  } else {
    return 0;
  }
};

export const fetchCustomers = request => baseFetcher(request).then(response => ({
  ...response,
  rows: response.rows.map(customer => ({
    ...customer,
    vm_count: getVmCount(customer),
  })),
}));
