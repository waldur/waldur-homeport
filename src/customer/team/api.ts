import { ENV } from '@waldur/configs/default';
import { getAll, getSelectData, patch, post } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { parseResponse } from '@waldur/table/api';
import { Fetcher, TableRequest } from '@waldur/table/types';

export const fetchCustomerUsers: Fetcher = (request: TableRequest) => {
  const { customer_uuid, ...rest } = request.filter;
  const url = `${ENV.apiEndpoint}api/customers/${customer_uuid}/users/`;
  const params = {
    page: request.currentPage,
    page_size: request.pageSize,
    ...rest,
  };
  return parseResponse(url, params);
};

export const addCustomerUser = (customer, user, role, expiration_time) =>
  post('/customer-permissions/', { customer, user, role, expiration_time });

export const closeReview = (reviewId: string) =>
  post(`/customer-permissions-reviews/${reviewId}/close/`);

export const grantPermission = (data) =>
  post(`/marketplace-offering-permissions/`, data);

export const updatePermission = (id: number, expiration_time: string) =>
  patch(`/marketplace-offering-permissions/${id}/`, {
    expiration_time,
  });

export const usersAutocomplete = async (
  query: object,
  prevOptions,
  currentPage: number,
) => {
  const params = {
    field: ['full_name', 'url', 'email'],
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

export const getOfferingPermissions = (userUuid: string) =>
  getAll<{ offering_name: string }>('/marketplace-offering-permissions/', {
    params: { user: userUuid },
  });
