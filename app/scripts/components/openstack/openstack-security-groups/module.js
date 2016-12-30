import securityGroupsLink from './security-groups-link';
import securityGroupsDialog from './security-groups-dialog';

export default module => {
  module.directive('securityGroupsLink', securityGroupsLink);
  module.directive('securityGroupsDialog', securityGroupsDialog);
};
