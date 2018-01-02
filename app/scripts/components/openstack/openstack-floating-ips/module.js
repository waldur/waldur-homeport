import openstackFloatingIpsService from './openstack-floating-ips-service';
import openstackFloatingIpsList from './openstack-floating-ips-list';
import breadcrumbsConfig from './breadcrumbs';
import { OpenStackFloatingIpSummary } from './OpenStackFloatingIpSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default module => {
  ResourceSummary.register('OpenStack.FloatingIP', OpenStackFloatingIpSummary);
  module.service('openstackFloatingIpsService', openstackFloatingIpsService);
  module.component('openstackFloatingIpsList', openstackFloatingIpsList);
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
