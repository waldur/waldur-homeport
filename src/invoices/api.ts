import { ENV } from '@waldur/configs/default';
import {
  deleteById,
  get,
  getAll,
  getList,
  patch,
  post,
  sendForm,
} from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { Customer } from '@waldur/workspace/types';

import { Invoice } from './types';

export const markAsPaid = (data) => {
  const reqData = {
    date: data.formData.date ? formatDate(data.formData.date) : undefined,
    proof: data.formData.proof,
  };
  return sendForm(
    'POST',
    `${ENV.apiEndpoint}api/invoices/${data.invoiceUuid}/paid/`,
    reqData,
  );
};

export const getGrowthChartData = (accounting_is_running: boolean, options?) =>
  get('/invoices/growth/', {
    params: {
      accounting_is_running,
      accounting_mode: ENV.accountingMode,
    },
    ...options,
  }).then((response) => response.data);

export const deleteInvoiceItem = (itemId) =>
  deleteById('/invoice-items/', itemId);

export const createInvoiceItemCompensation = (itemId, payload) =>
  post(`/invoice-items/${itemId}/create_compensation/`, payload);

export const updateInvoiceItem = (itemId, payload) =>
  patch(`/invoice-items/${itemId}/`, payload);

export const moveInvoiceItem = (itemId, payload) =>
  post(`/invoice-items/${itemId}/migrate_to/`, payload);

export const loadInvoices = (options) =>
  getAll<{ url: string; number: string; year: number; month: number }>(
    '/invoices/',
    options,
  );

export const fetchLatestInvoices = (customer: Customer, size: number) => {
  const url = `/invoices/`;
  const params = {
    page: 1,
    page_size: size,
    customer: customer.url,
    field: [
      'uuid',
      'items',
      'month',
      'year',
      'invoice_date',
      'state',
      'price',
      'total',
      'tax',
    ],
  };
  return getList<Invoice>(url, params);
};
