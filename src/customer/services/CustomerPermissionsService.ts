import Axios from 'axios';

import { post } from '@waldur/core/api';

export const CustomerPermissionsService = {
  create(payload) {
    return post('/customer-permissions/', payload);
  },

  delete(url) {
    return Axios.delete(url);
  },

  update(url, payload) {
    return Axios.patch(url, payload);
  },
};
