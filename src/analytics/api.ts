import { getList } from '@waldur/core/api';

export const loadServiceProviders = () =>
  getList('/service-settings/', {
    type: 'OpenStackTenant',
  });
