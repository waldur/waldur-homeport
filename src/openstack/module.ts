import routes from './analytics/routes';
import openstackBackupScheduleModule from './openstack-backup-schedule/module';
import openstackBackupModule from './openstack-backup/module';
import './openstack-floating-ips/module';
import openstackInstanceModule from './openstack-instance/module';
import openstackNetworkModule from './openstack-network/module';
import openstackSecurityGroupsModule from './openstack-security-groups/module';
import openstackSnapshotScheduleModule from './openstack-snapshot-schedule/module';
import openstackSnapshotModule from './openstack-snapshot/module';
import openstackSubnetModule from './openstack-subnet/module';
import openstackTenantModule from './openstack-tenant/module';
import openstackVolumeModule from './openstack-volume/module';
import './provider';
import './events';
import './marketplace';

export default module => {
  module.config(routes);
  openstackTenantModule(module);
  openstackInstanceModule(module);
  openstackVolumeModule(module);
  openstackBackupModule(module);
  openstackBackupScheduleModule(module);
  openstackNetworkModule(module);
  openstackSubnetModule(module);
  openstackSecurityGroupsModule(module);
  openstackSnapshotModule(module);
  openstackSnapshotScheduleModule(module);
};
