import Axios from 'axios';

import { post, getList } from '@waldur/core/api';
import { Permission } from '@waldur/workspace/types';

export const ProjectPermissionsService = {
  getList(params) {
    return getList<Permission>('/project-permissions/', params);
  },

  create(payload) {
    return post('/project-permissions/', payload);
  },

  delete(url) {
    return Axios.delete(url);
  },

  update(url, payload) {
    return Axios.patch(url, payload);
  },
};
