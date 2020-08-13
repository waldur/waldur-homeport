import { getAll, sendForm } from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { ENV } from '@waldur/core/services';
import { Invoice } from '@waldur/invoices/types';

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

export const getAllInvoices = (startDate: string) =>
  getAll<Invoice>('/invoices/', {
    params: {
      page_size: 200,
      field: ['month', 'year', 'total', 'customer_details'],
      start_date: `${startDate}-01`,
    },
  });
