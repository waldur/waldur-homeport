import * as ResourceSummary from '@waldur/resource/summary/registry';

import actionConfig from './actions';
import breadcrumbsConfig from './breadcrumbs';
import openstackSubnet from './openstack-subnet';
import openstackSubnetsService from './openstack-subnets-service';
import { OpenStackSubNetSummary } from './OpenStackSubNetSummary';
import './tabs';

export default module => {
  ResourceSummary.register('OpenStack.SubNet', OpenStackSubNetSummary);
  module.service('openstackSubnetsService', openstackSubnetsService);
  module.component('openstackSubnet', openstackSubnet);
  module.run(breadcrumbsConfig);
  module.config(actionConfig);
};
