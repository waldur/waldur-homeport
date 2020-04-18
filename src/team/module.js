import { connectAngularComponent } from '@waldur/store/connect';

import addProjectMember from './add-project-member';
import addTeamMember from './add-team-member';
import customerUsersList from './customer-users-list';
import { ProjectUsersList } from './ProjectUsersList';
import userSelector from './user-selector';

import './events';

export default module => {
  module.directive('userSelector', userSelector);
  module.component('addProjectMember', addProjectMember);
  module.component('addTeamMember', addTeamMember);
  module.directive('customerUsersList', customerUsersList);
  module.component('projectUsers', connectAngularComponent(ProjectUsersList));
};
