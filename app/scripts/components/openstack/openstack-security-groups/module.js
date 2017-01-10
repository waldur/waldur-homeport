import openstackSecurityGroupsService from './security-groups-service';
import openstackSecurityGroupsList from './security-groups-list';
import securityGroupsLink from './security-groups-link';
import securityGroupsDialog from './security-groups-dialog';

export default module => {
  module.service('openstackSecurityGroupsService', openstackSecurityGroupsService);
  module.component('openstackSecurityGroupsList', openstackSecurityGroupsList);
  module.directive('securityGroupsLink', securityGroupsLink);
  module.directive('securityGroupsDialog', securityGroupsDialog);
};
