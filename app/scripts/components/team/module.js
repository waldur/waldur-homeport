import userSelector from './user-selector';
import addProjectMember from './add-project-member';
import addTeamMember from './add-team-member';

export default module => {
  module.directive('userSelector', userSelector);
  module.directive('addProjectMember', addProjectMember);
  module.directive('addTeamMember', addTeamMember);
}
