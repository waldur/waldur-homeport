import { ENV } from '@waldur/configs/default';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';

import { getTemplateList } from './api';

export const templateAutocomplete = async (
  query: string,
  prevOptions,
  page,
) => {
  const params = {
    name: query,
    page: page,
    page_size: ENV.pageSize,
  };
  const response = await getTemplateList(params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};
