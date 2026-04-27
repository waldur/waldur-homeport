import {
  AzureSQLDatabaseSummaryConfiguration,
  AzureSQLServerSummaryConfiguration,
} from '@/azure/sql/summary';
import { AzureVirtualMachineSummaryConfiguration } from '@/azure/vm/summary';
import { OpenStackBackupSummaryConfiguration } from '@/openstack/openstack-backup/summary';
import { OpenStackFloatingIpSummaryConfiguration } from '@/openstack/openstack-floating-ips/summary';
import { OpenStackInstanceSummaryConfiguration } from '@/openstack/openstack-instance/summary';
import { OpenStackNetworkSummaryConfiguration } from '@/openstack/openstack-network/summary';
import { OpenStackSnapshotSummaryConfiguration } from '@/openstack/openstack-snapshot/summary';
import { OpenStackSubNetSummaryConfiguration } from '@/openstack/openstack-subnet/summary';
import {
  OpenStackPortSummaryConfiguration,
  OpenStackRouterSummaryConfiguration,
  OpenStackTenantSummaryConfiguration,
} from '@/openstack/openstack-tenant/summary';
import { OpenStackVolumeSummaryConfiguration } from '@/openstack/openstack-volume/summary';
import { RancherNodeSummaryConfiguration } from '@/rancher/node/summary';
import {
  VMwareVirtualMachineSummaryConfiguration,
  VMwareDiskSummaryConfiguration,
  VMwarePortSummaryConfiguration,
} from '@/vmware/summary';

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
