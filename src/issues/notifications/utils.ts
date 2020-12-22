import { ENV } from '@waldur/configs/default';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { getProjectList } from '@waldur/marketplace/common/api';

export const projectAutocomplete = async (
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const params = {
    name: query,
    field: ['name', 'uuid'],
    o: 'name',
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const response = await getProjectList(params);
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};
