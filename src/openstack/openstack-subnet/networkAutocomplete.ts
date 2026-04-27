import { openstackNetworksList } from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';

export const networkAutocomplete =
  (tenantUuid: string) =>
  async (query: string, prevOptions, { page }) => {
    const response = await openstackNetworksList({
      query: {
        name: query,
        tenant_uuid: tenantUuid,
        state: ['OK'],
        page: page,
        page_size: ENV.pageSize,
      },
    });
    return returnReactSelectAsyncPaginateObject(
      parseSelectData(response),
      prevOptions,
      page,
    );
  };
