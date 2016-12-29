import openstackInstanceSecurityGroups from './openstack-instance-security-groups';
import securityGroupDetails from './security-group-details';

export default module => {
  module.directive('openstackInstanceSecurityGroups', openstackInstanceSecurityGroups);
  module.directive('securityGroupDetails', securityGroupDetails);
};
