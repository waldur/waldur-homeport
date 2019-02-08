import actionConfig from './actions';
import breadcrumbsConfig from './breadcrumbs';
import openstackSubnetsService from './openstack-subnets-service';
import openstackSubnet from './openstack-subnet';
import openstackSubnetsList from './openstack-subnets-list';
import { OpenStackSubNetSummary } from './OpenStackSubNetSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default module => {
  ResourceSummary.register('OpenStack.SubNet', OpenStackSubNetSummary);
  module.service('openstackSubnetsService', openstackSubnetsService);
  module.component('openstackSubnet', openstackSubnet);
  module.component('openstackSubnetsList', openstackSubnetsList);
  module.run(breadcrumbsConfig);
  module.config(actionConfig);
  module.config(tabsConfig);
};

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStack.SubNet', {
    ...DEFAULT_RESOURCE_TABS,
    order: ['events'],
  });
}
