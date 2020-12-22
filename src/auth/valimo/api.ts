import Axios from 'axios';

import { ENV } from '@waldur/configs/default';

export const login = (phone) => {
  return Axios.post(`${ENV.apiEndpoint}api/auth-valimo/`, {
    phone,
  }).then((response) => response.data);
};

export const getAuthResult = (uuid) => {
  return Axios.post(`${ENV.apiEndpoint}api/auth-valimo/result/`, {
    uuid,
  }).then((response) => response.data);
};
