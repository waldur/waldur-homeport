import openstackAllocationPool from './openstack-allocation-pool';
import openstackSubnet from './openstack-subnet';
import openstackNetworksService from './openstack-networks-service';
import openstackTenantNetworks from './openstack-tenant-networks';

export default module => {
  module.service('openstackNetworksService', openstackNetworksService);
  module.component('openstackAllocationPool', openstackAllocationPool);
  module.component('openstackSubnet', openstackSubnet);
  module.component('openstackTenantNetworks', openstackTenantNetworks);
};
