import { ENV } from '@waldur/configs/default';
import { getSelectData } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { User } from '@waldur/workspace/types';

export const usersAutocomplete = async (
  customerUuid: string,
  query: object,
  prevOptions,
  currentPage: number,
) => {
  const params = {
    o: 'full_name',
    ...query,
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const response = await getSelectData<User[]>(
    `/customers/${customerUuid}/users/`,
    params,
  );
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};
