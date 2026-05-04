import { openstackPoolsList } from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';

export const poolAutocomplete =
  (loadBalancerUuid: string) =>
  async (query: string, prevOptions, { page }) => {
    const response = await openstackPoolsList({
      query: {
        name: query,
        load_balancer_uuid: loadBalancerUuid,
        page,
        page_size: ENV.pageSize,
        field: ['uuid', 'name'],
      },
    });
    return returnReactSelectAsyncPaginateObject(
      parseSelectData(response),
      prevOptions,
      page,
    );
  };
