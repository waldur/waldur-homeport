import Axios from 'axios';

import { ENV } from '@waldur/configs/default';

import { UserDetails } from './types';

export const fetchUserDetails = (civil_number: string, tax_number: string) => {
  const params = {
    civil_number,
    tax_number,
  };
  const url = `${ENV.apiEndpoint}api-auth/bcc/user-details/`;
  return Axios.get<UserDetails>(url, { params }).then(
    (response) => response.data,
  );
};
