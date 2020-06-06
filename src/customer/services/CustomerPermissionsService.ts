import Axios from 'axios';

import { post } from '@waldur/core/api';
import { $q } from '@waldur/core/services';

export const CustomerPermissionsService = {
  create(payload) {
    return $q.when(post('/customer-permissions/', payload));
  },

  delete(url) {
    return $q.when(Axios.delete(url));
  },

  update(url, payload) {
    return $q.when(Axios.patch(url, payload));
  },
};
