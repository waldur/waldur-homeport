import { AzureSqlServerActions } from '@waldur/azure/sql/actions';
import { AzureVirtualMachineActions } from '@waldur/azure/vm/actions';
import { OpenStackBackupActions } from '@waldur/openstack/openstack-backup/actions';
import { OpenStackFloatingIPActions } from '@waldur/openstack/openstack-floating-ips/actions';
import { OpenStackNetworkActions } from '@waldur/openstack/openstack-network/actions';
import { OpenStackSecurityGroupActions } from '@waldur/openstack/openstack-security-groups/actions';
import { OpenStackServerGroupActions } from '@waldur/openstack/openstack-server-groups/actions';
import { OpenStackSnapshotActions } from '@waldur/openstack/openstack-snapshot/actions';
import { OpenStackSubNetActions } from '@waldur/openstack/openstack-subnet/actions';
import { OpenStackPortActions } from '@waldur/openstack/openstack-tenant/ports';
import { OpenStackRouterActions } from '@waldur/openstack/openstack-tenant/tenant-routers';
import { RancherClusterActions } from '@waldur/rancher/cluster/actions';
import { RancherNodeActions } from '@waldur/rancher/node/actions';
import {
  VMwareDiskActions,
  VMwarePortActions,
  VMwareVirtualMachineActions,
} from '@waldur/vmware/actions';

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
