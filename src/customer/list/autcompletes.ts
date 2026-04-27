import { organizationGroupsList } from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';

export const organizationGroupAutocomplete = async (
  query: string,
  prevOptions,
  { page },
) => {
  const response = await organizationGroupsList({
    query: {
      name: query,
      page: page,
      page_size: ENV.pageSize,
      o: 'name',
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    page,
  );
};
