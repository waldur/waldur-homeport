import OpenstackInstanceSecurityGroupsStory from '@waldur/openstack/openstack-instance/OpenstackInstanceSecurityGroupsStory';

export default module => {
  module.component('openstackInstanceSecurityGroupsStory', OpenstackInstanceSecurityGroupsStory);
  module.config(storyBookRoutes);
};

// @ngInject
function storyBookRoutes($stateProvider) {
  $stateProvider
    .state('openstack-instance-security-groups-story', {
      url: '/openstack-instance-security-groups-story/',
      template: '<openstack-instance-security-groups-story></openstack-instance-security-groups-story>',
    });
}
