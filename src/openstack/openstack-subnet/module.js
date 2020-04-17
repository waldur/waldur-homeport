import * as ResourceSummary from '@waldur/resource/summary/registry';

import actionConfig from './actions';
import breadcrumbsConfig from './breadcrumbs';
import openstackSubnetsList from './NetworkSubnetsList';
import openstackSubnet from './openstack-subnet';
import openstackSubnetsService from './openstack-subnets-service';
import { OpenStackSubNetSummary } from './OpenStackSubNetSummary';

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStack.SubNet', {
    ...DEFAULT_RESOURCE_TABS,
    order: ['events'],
  });
}

export default module => {
  ResourceSummary.register('OpenStack.SubNet', OpenStackSubNetSummary);
  module.service('openstackSubnetsService', openstackSubnetsService);
  module.component('openstackSubnet', openstackSubnet);
  module.component('openstackSubnetsList', openstackSubnetsList);
  module.run(breadcrumbsConfig);
  module.config(actionConfig);
  module.config(tabsConfig);
};
