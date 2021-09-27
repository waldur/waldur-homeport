import { ENV } from '@waldur/configs/default';
import { put, sendForm } from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';

export const abc = (data) => {
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

export const updateDescription = (data) =>
  put(`/marketplace-service-providers/${data.uuid}/`, { ...data.formData });
