import { sendForm } from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { ENV } from '@waldur/core/services';

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
