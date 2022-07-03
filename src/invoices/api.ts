import { ENV } from '@waldur/configs/default';
import {
  deleteById,
  get,
  getAll,
  patch,
  post,
  sendForm,
} from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { parseResponse } from '@waldur/table/api';
import { Fetcher, TableRequest } from '@waldur/table/types';

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

export const getGrowthChartData = (accounting_is_running: boolean) =>
  get('/invoices/growth/', {
    params: {
      accounting_is_running,
      accounting_mode: ENV.accountingMode,
    },
  }).then((response) => response.data);

export const fetchInvoicesStats: Fetcher = (request: TableRequest) => {
  const { invoice_uuid, ...rest } = request.filter;
  const url = `${ENV.apiEndpoint}api/invoices/${invoice_uuid}/stats/`;
  const params = {
    page: request.currentPage,
    page_size: request.pageSize,
    ...rest,
  };
  return parseResponse(url, params);
};

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
