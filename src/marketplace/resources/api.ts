// import { post } from '@waldur/core/api';
import Axios from 'axios';

export const cancelResource = (resourceUrl: string) => {
  // post(`/booking-resources/${bookingUuid}/reject/`)
  return Axios.post(`${resourceUrl}reject/`);
};
