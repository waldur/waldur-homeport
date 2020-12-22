import { ENV } from '@waldur/configs/default';
import { getFirst, sendForm } from '@waldur/core/api';

interface UpdateLogoParams {
  customerUuid: string;
  image: HTMLImageElement;
}

interface RemoveLogoParams {
  customerUuid: string;
}

export const uploadLogo = (params: UpdateLogoParams) =>
  sendForm('PATCH', `${ENV.apiEndpoint}api/customers/${params.customerUuid}/`, {
    image: params.image,
  });

export const removeLogo = (params: RemoveLogoParams) =>
  sendForm('PATCH', `${ENV.apiEndpoint}api/customers/${params.customerUuid}/`, {
    image: '',
  });

export const getPendingReview = (customerId: string) =>
  getFirst('/customer-permissions-reviews/', {
    customer_uuid: customerId,
    is_pending: true,
  });
