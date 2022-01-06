import { ENV } from '@waldur/configs/default';
import { get, put } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import {
  getDivisionTypesList,
  getOrganizationDivisionList,
} from '@waldur/marketplace/common/api';

interface TotalStats {
  price: number;
  total: number;
}

export const getTotal = (params) =>
  get<TotalStats>('/billing-total-cost/', params).then(
    (response) => response.data,
  );

export const getInvoice = (customer, date) =>
  get('/invoices/', {
    params: { customer: customer.url, year: date.year, month: date.month },
  }).then((response) => response.data[0]);

export const updateOrganization = (data) =>
  put(`/customers/${data.uuid}/`, data);

export const organizationDivisionAutocomplete = async (
  query: string,
  prevOptions,
  { page },
) => {
  const params = {
    name: query,
    page: page,
    page_size: ENV.pageSize,
    o: 'name',
  };
  const response = await getOrganizationDivisionList(params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};

export const divisionTypeAutocomplete = async (
  query: string,
  prevOptions,
  { page },
) => {
  const params = {
    name: query,
    page: page,
    page_size: ENV.pageSize,
    o: 'name',
  };
  const response = await getDivisionTypesList(params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};
