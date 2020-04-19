import addProjectMember from './add-project-member';
import projectTeam from './ProjectTeam';
import userSelector from './user-selector';

import './events';

export default module => {
  module.directive('userSelector', userSelector);
  module.component('addProjectMember', addProjectMember);
  module.component('projectTeam', projectTeam);
};
