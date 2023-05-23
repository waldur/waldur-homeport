import { ENV } from '@waldur/configs/default';
import { get, post, sendForm } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import {
  getOrganizationGroupTypesList,
  getOrganizationGroupList,
} from '@waldur/marketplace/common/api';

interface TotalStats {
  price: number;
  total: number;
}

export const getTotal = (params) =>
  get<TotalStats>('/billing-total-cost/', params).then(
    (response) => response.data,
  );

export const getInvoice = (invoiceUrl, date) =>
  get('/invoices/', {
    params: { customer: invoiceUrl, year: date.year, month: date.month },
  }).then((response) => response.data[0]);

export const updateOrganization = (formData) => {
  const data = { ...formData };
  if (!data.image) {
    data.image = '';
  } else if (!(data.image instanceof File)) {
    data.image = undefined;
  }

  return sendForm(
    'PATCH',
    `${ENV.apiEndpoint}api/customers/${data.uuid}/`,
    data,
  );
};

export const organizationGroupAutocomplete = async (
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
  const response = await getOrganizationGroupList(params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};

export const organizationGroupTypeAutocomplete = async (
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
  const response = await getOrganizationGroupTypesList(params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};

export const sendFinancialReport = (payload) => {
  return post('/invoice/send-financial-report-by-mail/', payload);
};
