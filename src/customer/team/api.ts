import { post } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
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

export const closeReview = (reviewId: string) =>
  post(`/customer-permissions-reviews/${reviewId}/close/`);
