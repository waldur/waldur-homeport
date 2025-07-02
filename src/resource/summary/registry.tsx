import {
  AzureSQLDatabaseSummaryConfiguration,
  AzureSQLServerSummaryConfiguration,
} from '@waldur/azure/sql/summary';
import { AzureVirtualMachineSummaryConfiguration } from '@waldur/azure/vm/summary';
import { OpenStackBackupSummaryConfiguration } from '@waldur/openstack/openstack-backup/summary';
import { OpenStackFloatingIpSummaryConfiguration } from '@waldur/openstack/openstack-floating-ips/summary';
import { OpenStackInstanceSummaryConfiguration } from '@waldur/openstack/openstack-instance/summary';
import { OpenStackNetworkSummaryConfiguration } from '@waldur/openstack/openstack-network/summary';
import { OpenStackSnapshotSummaryConfiguration } from '@waldur/openstack/openstack-snapshot/summary';
import { OpenStackSubNetSummaryConfiguration } from '@waldur/openstack/openstack-subnet/summary';
import {
  OpenStackPortSummaryConfiguration,
  OpenStackRouterSummaryConfiguration,
  OpenStackTenantSummaryConfiguration,
} from '@waldur/openstack/openstack-tenant/summary';
import { OpenStackVolumeSummaryConfiguration } from '@waldur/openstack/openstack-volume/summary';
import { RancherNodeSummaryConfiguration } from '@waldur/rancher/node/summary';
import {
  VMwareVirtualMachineSummaryConfiguration,
  VMwareDiskSummaryConfiguration,
  VMwarePortSummaryConfiguration,
} from '@waldur/vmware/summary';

import { ResourceSummaryConfiguration } from './types';

const registry: Record<string, ResourceSummaryConfiguration> = {};

const register = (configuration: ResourceSummaryConfiguration) => {
  registry[configuration.type] = configuration;
};

export const get = (type: string): ResourceSummaryConfiguration => {
  return registry[type];
};

register(AzureSQLDatabaseSummaryConfiguration);
register(AzureSQLServerSummaryConfiguration);
register(AzureVirtualMachineSummaryConfiguration);
register(OpenStackBackupSummaryConfiguration);
register(OpenStackFloatingIpSummaryConfiguration);
register(OpenStackNetworkSummaryConfiguration);
register(OpenStackRouterSummaryConfiguration);
register(OpenStackSnapshotSummaryConfiguration);
register(OpenStackSubNetSummaryConfiguration);
register(OpenStackPortSummaryConfiguration);
register(OpenStackTenantSummaryConfiguration);
register(OpenStackInstanceSummaryConfiguration);
register(OpenStackVolumeSummaryConfiguration);
register(RancherNodeSummaryConfiguration);
register(VMwareVirtualMachineSummaryConfiguration);
register(VMwareDiskSummaryConfiguration);
register(VMwarePortSummaryConfiguration);
