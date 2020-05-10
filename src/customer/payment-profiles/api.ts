import { deleteById, post, patch } from '@waldur/core/api';

export const createPaymentProfile = data => {
  const reqData = {
    is_active: false,
    name: data.name,
    organization: data.customer.url,
    payment_type: data.payment_type.value,
    attributes: {
      end_date: data.end_date,
      agreement_number: data.agreement_number,
    },
  };
  return post('/payment-profiles/', reqData).then(response => response.data);
};

export const updatePaymentProfile = data => {
  const reqData = {
    name: data.formData.name,
    payment_type: data.formData.payment_type.value,
    attributes: {
      end_date: data.formData.end_date,
      agreement_number: data.formData.agreement_number,
    },
  };
  return patch(`/payment-profiles/${data.uuid}/`, reqData).then(
    response => response.data,
  );
};

export const deletePaymentProfile = (uuid: string) =>
  deleteById('/payment-profiles/', uuid);

export const enablePaymentProfile = (uuid: string) =>
  post(`/payment-profiles/${uuid}/enable/`).then(response => response.data);
