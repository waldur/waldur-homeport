import currentStateService from './current-state-service';
import projectPermissionsService from './project-permissions-service';
import quotasService from './quotas-service';

export default module => {
  module.service('currentStateService', currentStateService);
  module.service('projectPermissionsService', projectPermissionsService);
  module.service('quotasService', quotasService);
};
