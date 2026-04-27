import { AzureSqlServerActions } from '@/azure/sql/actions';
import { AzureVirtualMachineActions } from '@/azure/vm/actions';
import { OpenStackBackupActions } from '@/openstack/openstack-backup/actions';
import { OpenStackFloatingIPActions } from '@/openstack/openstack-floating-ips/actions';
import { OpenStackNetworkActions } from '@/openstack/openstack-network/actions';
import { OpenStackSecurityGroupActions } from '@/openstack/openstack-security-groups/actions';
import { OpenStackServerGroupActions } from '@/openstack/openstack-server-groups/actions';
import { OpenStackSnapshotActions } from '@/openstack/openstack-snapshot/actions';
import { OpenStackSubNetActions } from '@/openstack/openstack-subnet/actions';
import { OpenStackPortActions } from '@/openstack/openstack-tenant/ports';
import { OpenStackRouterActions } from '@/openstack/openstack-tenant/tenant-routers';
import { RancherClusterActions } from '@/rancher/cluster/actions';
import { RancherNodeActions } from '@/rancher/node/actions';
import {
  VMwareDiskActions,
  VMwarePortActions,
  VMwareVirtualMachineActions,
} from '@/vmware/actions';

import { ActionConfiguration, ActionItemType } from './types';

const actions: Record<string, ActionItemType[]> = {};

const register = (config: ActionConfiguration) => {
  actions[config.type] = config.actions;
};

export const getActions = (type) => actions[type] || [];

register(AzureSqlServerActions);
register(AzureVirtualMachineActions);
register(OpenStackBackupActions);
register(OpenStackFloatingIPActions);
register(OpenStackNetworkActions);
register(OpenStackPortActions);
register(OpenStackRouterActions);
register(OpenStackSecurityGroupActions);
register(OpenStackServerGroupActions);
register(OpenStackSnapshotActions);
register(OpenStackSubNetActions);
register(RancherClusterActions);
register(RancherNodeActions);
register(VMwareDiskActions);
register(VMwarePortActions);
register(VMwareVirtualMachineActions);
