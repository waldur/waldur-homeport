import { openstackFloatingIpsList } from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';

export const floatingIpAutocomplete =
  (tenantUuid: string) =>
  async (query: string, prevOptions, { page }) => {
    const response = await openstackFloatingIpsList({
      query: {
        address: query || undefined,
        tenant_uuid: tenantUuid,
        page,
        page_size: ENV.pageSize,
        field: ['uuid', 'url', 'address', 'name'],
      },
    });
    return returnReactSelectAsyncPaginateObject(
      parseSelectData(response),
      prevOptions,
      page,
    );
  };
