import openstackFloatingIpsService from './openstack-floating-ips-service';
import openstackFloatingIpsList from './openstack-floating-ips-list';

export default module => {
  module.service('openstackFloatingIpsService', openstackFloatingIpsService);
  module.component('openstackFloatingIpsList', openstackFloatingIpsList);
  module.config(actionConfig);
};

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStack.FloatingIP', {
    order: [
      'pull',
      'destroy'
    ],
    options: {
      pull: {
        title: 'Synchronise'
      },
    }
  });
}
