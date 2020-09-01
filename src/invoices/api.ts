import { get, sendForm } from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { ENV } from '@waldur/core/services';
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
