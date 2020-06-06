import { connectAngularComponent } from '@waldur/store/connect';

import { UserEditContainer } from './support/UserEditContainer';
import userDetails from './user-details';
import { UserSidebar } from './UserSidebar';
import { UsersService } from './UsersService';
import { stateUtilsService, attachStateUtils } from './utils';
import './events';

export default module => {
  module.component('userSidebar', connectAngularComponent(UserSidebar));
  module.directive('userDetails', userDetails);
  module.component(
    'userEdit',
    connectAngularComponent(UserEditContainer, ['user', 'initial', 'onSave']),
  );
  module.service('stateUtilsService', stateUtilsService);
  module.constant('usersService', UsersService);
  module.run(attachStateUtils);
};
