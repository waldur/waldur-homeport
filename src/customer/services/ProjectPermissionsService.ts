import Axios from 'axios';

import { post, getList } from '@waldur/core/api';
import { $q } from '@waldur/core/services';

class ProjectPermissionsServiceClass {
  getList(params) {
    return $q.when(getList('/project-permissions/', params));
  }

  create(payload) {
    return $q.when(post('/project-permissions/', payload));
  }

  delete(url) {
    return $q.when(Axios.delete(url));
  }

  update(url, payload) {
    return $q.when(Axios.patch(url, payload));
  }
}

export const ProjectPermissionsService = new ProjectPermissionsServiceClass();
