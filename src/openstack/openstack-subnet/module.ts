import * as ResourceSummary from '@waldur/resource/summary/registry';

import actionConfig from './actions';
import './breadcrumbs';
import openstackSubnet from './openstack-subnet';
import { OpenStackSubNetSummary } from './OpenStackSubNetSummary';
import './tabs';

export default module => {
  ResourceSummary.register('OpenStack.SubNet', OpenStackSubNetSummary);
  module.component('openstackSubnet', openstackSubnet);
  module.config(actionConfig);
};
