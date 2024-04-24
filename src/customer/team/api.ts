import { ENV } from '@waldur/configs/default';
import { getSelectData, post } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';

export const closeReview = (reviewId: string) =>
  post(`/customer-permissions-reviews/${reviewId}/close/`);

export const usersAutocomplete = async (
  query: object,
  prevOptions,
  currentPage: number,
) => {
  const params = {
    field: [
      'full_name',
      'url',
      'email',
      'uuid',
      'username',
      'registration_method',
      'is_active',
    ],
    o: 'full_name',
    ...query,
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const response = await getSelectData('/users/', params);
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};
