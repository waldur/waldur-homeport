import * as moment from 'moment-timezone';

import { getList } from '@waldur/core/api';

export const fetchProjects = (customerUuid: string) =>
  getList('/projects/', { customer: customerUuid });

export const fetchQuotaHistory = (quotaUuid: string) => {
  const url = `/quotas/${quotaUuid}/history/`;
  const end = +moment().format('X');
  const start = end - 60 * 60 * 24 * 30;
  const pointsCount = 15;
  return getList(url, {
    start,
    end,
    points_count: pointsCount,
  });
};

export const loadServiceProviders = () => getList('/service-settings/', {
  type: 'OpenStackTenant',
});

export const fetchTenants = (customerId: string) => getList('/openstack-tenants/', {
  customer_uuid: customerId,
});
