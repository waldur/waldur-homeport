import { deleteById, sendForm } from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { ENV } from '@waldur/core/services';

export const createPayment = (data) => {
  const reqData = {
    date_of_payment: formatDate(data.formData.date_of_payment),
    sum: data.formData.sum,
    proof: data.formData.proof,
    profile: data.profile_url,
  };
  return sendForm('POST', `${ENV.apiEndpoint}api/payments/`, reqData);
};

export const updatePayment = (data) => {
  const reqData = {
    date_of_payment: formatDate(data.formData.date_of_payment),
    sum: data.formData.sum,
    proof: data.formData.proof,
  };
  return sendForm(
    'PATCH',
    `${ENV.apiEndpoint}api/payments/${data.uuid}/`,
    reqData,
  );
};

export const deletePayment = (uuid: string) => deleteById('/payments/', uuid);
