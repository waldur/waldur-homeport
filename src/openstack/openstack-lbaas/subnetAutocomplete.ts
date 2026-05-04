import { openstackSubnetsList } from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';

export const subnetAutocomplete =
  (tenantUuid: string) =>
  async (query: string, prevOptions, { page }) => {
    const response = await openstackSubnetsList({
      query: {
        name: query,
        tenant_uuid: tenantUuid,
        state: ['OK'],
        page: page,
        page_size: ENV.pageSize,
        field: ['uuid', 'name', 'backend_id', 'cidr', 'network_name'],
      },
    });
    return returnReactSelectAsyncPaginateObject(
      parseSelectData(response),
      prevOptions,
      page,
    );
  };
