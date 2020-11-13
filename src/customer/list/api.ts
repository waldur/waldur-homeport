import { get, put } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import {
  getCategories,
  getDivisionTypesList,
  getOrganizationDivisionList,
} from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { ExpandableRow } from '@waldur/resource/ResourceExpandableRow';

interface TotalStats {
  price: number;
  total: number;
}

export const getTotal = (params) =>
  get<TotalStats>('/billing-total-cost/', params).then(
    (response) => response.data,
  );

const getCustomerCounters = (customerId: string) =>
  get(`/customers/${customerId}/counters/`).then((response) => response.data);

export const getInvoice = (customer, date) =>
  get('/invoices/', {
    params: { customer: customer.url, year: date.year, month: date.month },
  }).then((response) => response.data[0]);

const parseCategories = (
  categories: Category[],
  counters: object,
): ExpandableRow[] => {
  return categories
    .map((category) => ({
      label: category.title,
      value: counters[`marketplace_category_${category.uuid}`],
    }))
    .filter((row) => row.value)
    .sort((a, b) => a.label.localeCompare(b.label));
};

export async function loadCustomerResources(props): Promise<ExpandableRow[]> {
  const categories = await getCategories({
    params: { field: ['uuid', 'title'] },
  });
  const counters = await getCustomerCounters(props.uuid);
  return parseCategories(categories, counters);
}

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
