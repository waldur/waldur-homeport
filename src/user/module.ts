import { connectAngularComponent } from '@waldur/store/connect';

import keysModule from './keys/module';
import userRoutes from './routes';
import { UserEditContainer } from './support/UserEditContainer';
import userDetails from './user-details';
import usersService from './users-service';
import { UserSidebar } from './UserSidebar';
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
  module.service('usersService', usersService);
  module.run(attachStateUtils);
  module.config(userRoutes);
  keysModule(module);
};
