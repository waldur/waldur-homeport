import openstackFloatingIpsService from './openstack-floating-ips-service';
import openstackFloatingIpsList from './openstack-floating-ips-list';
import { openstackFloatingIpSummary } from './openstack-floating-ip-summary';
import breadcrumbsConfig from './breadcrumbs';

export default module => {
  module.service('openstackFloatingIpsService', openstackFloatingIpsService);
  module.component('openstackFloatingIpsList', openstackFloatingIpsList);
  module.component('openstackFloatingIpSummary', openstackFloatingIpSummary);
  module.config(actionConfig);
  module.run(breadcrumbsConfig);
};

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStack.FloatingIP', {
    order: [
      'pull',
      'destroy'
    ],
    options: {
      pull: {
        title: gettext('Synchronise')
      },
    }
  });
}
