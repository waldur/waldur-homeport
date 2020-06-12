import { UsersService } from './UsersService';
import { stateUtilsService, attachStateUtils } from './utils';
import './events';

export default module => {
  module.service('stateUtilsService', stateUtilsService);
  module.constant('usersService', UsersService);
  module.run(attachStateUtils);
};
