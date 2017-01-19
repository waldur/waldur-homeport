import actionConfig from './actions';
import breadcrumbsConfig from './breadcrumbs';
import openstackSubnetsService from './openstack-subnets-service';
import openstackSubnet from './openstack-subnet';
import openstackSubnetsList from './openstack-subnets-list';
import { openstackSubnetSummary } from './openstack-subnet-summary';

export default module => {
  module.service('openstackSubnetsService', openstackSubnetsService);
  module.component('openstackSubnet', openstackSubnet);
  module.component('openstackSubnetsList', openstackSubnetsList);
  module.component('openstackSubnetSummary', openstackSubnetSummary);
  module.run(breadcrumbsConfig);
  module.config(actionConfig);
};
