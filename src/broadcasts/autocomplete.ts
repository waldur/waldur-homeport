import { broadcastMessageTemplatesList } from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';

export const templateAutocomplete = async (
  query: string,
  prevOptions,
  page,
) => {
  const response = await broadcastMessageTemplatesList({
    query: {
      name: query,
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
