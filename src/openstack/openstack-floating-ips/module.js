import * as ResourceSummary from '@waldur/resource/summary/registry';

import breadcrumbsConfig from './breadcrumbs';
import openstackFloatingIpsList from './FloatingIpsList';
import { OpenStackFloatingIpSummary } from './OpenStackFloatingIpSummary';

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStack.FloatingIP', {
    order: ['pull', 'destroy'],
    options: {
      pull: {
        title: gettext('Synchronise'),
      },
    },
  });
}

export default module => {
  ResourceSummary.register('OpenStack.FloatingIP', OpenStackFloatingIpSummary);
  module.component('openstackFloatingIpsList', openstackFloatingIpsList);
  module.config(actionConfig);
  module.run(breadcrumbsConfig);
};
