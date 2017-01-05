import OpenStackSummaryService from './openstack-summary-service';
import openstackTenantModule from './openstack-tenant/module';
import openstackInstanceModule from './openstack-instance/module';
import openstackVolumeModule from './openstack-volume/module';
import openstackBackupModule from './openstack-backup/module';
import openstackNetworkModule from './openstack-network/module';
import securityGroupsModule from './openstack-security-groups/module';

export default module => {
  module.service('OpenStackSummaryService', OpenStackSummaryService);
  openstackTenantModule(module);
  openstackInstanceModule(module);
  openstackVolumeModule(module);
  openstackBackupModule(module);
  openstackNetworkModule(module);
  securityGroupsModule(module);
};
