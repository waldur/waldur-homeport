import OpenstackInstanceSecurityGroupsStory from '@waldur/openstack/openstack-instance/OpenstackInstanceSecurityGroupsStory';
import OpenstackInstanceNetworksStory from '@waldur/openstack/openstack-instance/OpenstackInstanceNetworksStory';
import SelectDialogFieldStory from '@waldur/form-react/SelectDialogFieldStory';

export default module => {
  module.component(
    'openstackInstanceSecurityGroupsStory',
    OpenstackInstanceSecurityGroupsStory,
  );
  module.component(
    'openstackInstanceNetworksStory',
    OpenstackInstanceNetworksStory,
  );
  module.component('selectDialogFieldStory', SelectDialogFieldStory);
  module.config(storyBookRoutes);
};

// @ngInject
function storyBookRoutes($stateProvider) {
  $stateProvider
    .state('openstack-instance-security-groups-story', {
      url: '/openstack-instance-security-groups-story/',
      template:
        '<openstack-instance-security-groups-story></openstack-instance-security-groups-story>',
    })
    .state('openstack-instance-networks-story', {
      url: '/openstack-instance-networks-story/',
      template:
        '<openstack-instance-networks-story></openstack-instance-networks-story>',
    })
    .state('select-dialog-field-story', {
      url: '/select-dialog-field-story/',
      template: '<select-dialog-field-story></select-dialog-field-story>',
    });
}
