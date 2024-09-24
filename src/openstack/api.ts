import { getAll, put, post, deleteById, get } from '@waldur/core/api';
import { terminateResource } from '@waldur/marketplace/common/api';
import {
  Flavor,
  FloatingIp,
  Subnet,
  Image,
  OpenStackInstance,
} from '@waldur/openstack/openstack-instance/types';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';

import {
  EthernetType,
  SecurityGroupDirection,
  SecurityGroupProtocol,
  ServerGroupType,
  VolumeType,
} from './types';

export interface BackupRestoreRequestBody {
  flavor: string;
  ports: {
    subnet: string;
  }[];
  floating_ips: {
    subnet: string;
    url?: string;
  }[];
  security_groups: {
    url: string;
  }[];
}

interface CreateSecurityGroupRuleRequestBody {
  ethertype: EthernetType;
  direction: SecurityGroupDirection;
  protocol: SecurityGroupProtocol;
  from_port: number;
  to_port: number;
  port_range?: { min: number; max: number };
  cidr: string;
  remote_group?: string;
  description?: string;
}

export interface CreateSecurityGroupRequestBody {
  name: string;
  description?: string;
  rules: CreateSecurityGroupRuleRequestBody[];
}

export interface CreateServerGroupRequestBody {
  name: string;
  policy: string;
}

interface UpdatePortsRequestBody {
  ports: {
    subnet: string;
  }[];
}

interface UpdateSecurityGroupsRequestBody {
  security_groups: {
    url: string;
  }[];
}

interface CreateNetworkRequestBody {
  name: string;
  description: string;
}

export interface DestroyInstanceParams {
  delete_volumes?: boolean;
  release_floating_ips?: boolean;
}

export interface ChangeFlavorRequestBody {
  flavor: string;
}

export const pullTenant = (id: string) =>
  post(`/openstack-tenants/${id}/pull/`);

export const pullFloatingIP = (id: string) =>
  post(`/openstack-floating-ips/${id}/pull/`);

export const destroyFloatingIP = (id: string) =>
  deleteById('/openstack-floating-ips/', id);

export const pullSubnet = (id: string) =>
  post(`/openstack-subnets/${id}/pull/`);

export const connectSubnet = (id: string) =>
  post(`/openstack-subnets/${id}/connect/`);

export const disconnectSubnet = (id: string) =>
  post(`/openstack-subnets/${id}/disconnect/`);

export const destroySubnet = (id: string) =>
  deleteById('/openstack-subnets/', id);

export const pullSecurityGroup = (id: string) =>
  post(`/openstack-security-groups/${id}/pull/`);

export const pullServerGroup = (id: string) =>
  post(`/openstack-server-groups/${id}/pull/`);

export const destroySecurityGroup = (id: string) =>
  deleteById('/openstack-security-groups/', id);

export const destroyServerGroup = (id: string) =>
  deleteById('/openstack-server-groups/', id);

export const pullNetwork = (id: string) =>
  post(`/openstack-networks/${id}/pull/`);

export const destroyNetwork = (id: string) =>
  deleteById('/openstack-networks/', id);

export const pullSnapshot = (id: string) =>
  post(`/openstack-snapshots/${id}/pull/`);

export const destroySnapshot = (id: string) =>
  deleteById('/openstack-snapshots/', id);

export const pullInstance = (id: string) =>
  post(`/openstack-instances/${id}/pull/`);

export const startInstance = (id: string) =>
  post(`/openstack-instances/${id}/start/`);

export const stopInstance = (id: string) =>
  post(`/openstack-instances/${id}/stop/`);

export const restartInstance = (id: string) =>
  post(`/openstack-instances/${id}/restart/`);

export const loadFlavors = (params) =>
  getAll<Flavor>('/openstack-flavors/', { params });

export const loadImages = (params) =>
  getAll<Image>('/openstack-images/', { params });

export const loadSecurityGroups = (params) =>
  getAll<SecurityGroup>('/openstack-security-groups/', {
    params,
  });

export const loadSecurityGroupsResources = (params?) =>
  getAll<SecurityGroup>('/openstack-security-groups/', { params });

export const loadServerGroupsResources = (params?) =>
  getAll<ServerGroupType>('/openstack-server-groups/', { params });

export const updateSecurityGroup = (id: string, data) =>
  put(`/openstack-security-groups/${id}/`, data);

export const setSecurityGroupRules = (id: string, data) =>
  post(`/openstack-security-groups/${id}/set_rules/`, data);

export const loadVolumeTypes = (params) =>
  getAll<VolumeType>('/openstack-volume-types/', {
    params,
  });

export const loadSubnets = (params) =>
  getAll<Subnet>('/openstack-subnets/', { params });

export const loadFloatingIps = (params) =>
  getAll<FloatingIp>('/openstack-floating-ips/', {
    params,
  });

export const setFloatingIps = (id: string, data) =>
  post(`/openstack-instances/${id}/update_floating_ips/`, data);

export const getInstanceConsoleUrl = (id: string) =>
  get<{ url: string }>(`/openstack-instances/${id}/console/`).then(
    (response) => response.data.url,
  );

export const getInstanceConsoleLog = (id: string) =>
  get<string>(`/openstack-instances/${id}/console_log/`).then(
    (response) => response.data,
  );

export const updatePorts = (id: string, data: UpdatePortsRequestBody) =>
  post(`/openstack-instances/${id}/update_ports/`, data);

export const updateSecurityGroups = (
  id: string,
  data: UpdateSecurityGroupsRequestBody,
) => post(`/openstack-instances/${id}/update_security_groups/`, data);

export const getInstances = (params) =>
  getAll<OpenStackInstance>('/openstack-instances/', {
    params,
  });

export const updateTenant = (id: string, data) =>
  put(`/openstack-tenants/${id}/`, data);

export const createSecurityGroup = (
  id: string,
  data: CreateSecurityGroupRequestBody,
) => post(`/openstack-tenants/${id}/create_security_group/`, data);

export const createServerGroup = (
  id: string,
  data: CreateServerGroupRequestBody,
) => post(`/openstack-tenants/${id}/create_server_group/`, data);

export const createNetwork = (id: string, data: CreateNetworkRequestBody) =>
  post(`/openstack-tenants/${id}/create_network/`, data);

export const pullTenantSecurityGroups = (id: string) =>
  post(`/openstack-tenants/${id}/pull_security_groups/`);

export const pullTenantServerGroups = (id: string) =>
  post(`/openstack-tenants/${id}/pull_server_groups/`);

export const pullTenantFloatingIps = (id: string) =>
  post(`/openstack-tenants/${id}/pull_floating_ips/`);

export const createFloatingIp = (id: string) =>
  post(`/openstack-tenants/${id}/create_floating_ip/`);

export const updateNetwork = (id: string, data) =>
  put(`/openstack-networks/${id}/`, data);

export const updateSubnet = (id: string, data) =>
  put(`/openstack-subnets/${id}/`, data);

export const createSubnet = (id: string, data) =>
  post(`/openstack-networks/${id}/create_subnet/`, data);

export const setNetworkMtu = (id, mtu) =>
  post(`/openstack-networks/${id}/set_mtu/`, { mtu });

export const updateInstance = (id: string, data) =>
  put(`/openstack-instances/${id}/`, data);

export const changeFlavor = (id: string, data: ChangeFlavorRequestBody) =>
  post(`/openstack-instances/${id}/change_flavor/`, data);

export const destroyInstance = (
  id: string,
  attributes: DestroyInstanceParams,
) => terminateResource(id, { attributes });

export const forceDestroyInstance = (
  id: string,
  attributes: DestroyInstanceParams,
) =>
  terminateResource(id, {
    attributes: { action: 'force_destroy', ...attributes },
  });

export const destroyPort = (id: string) => deleteById('/openstack-ports/', id);

export const updateVolume = (id: string, data) =>
  put(`/openstack-volumes/${id}/`, data);

export const retypeVolume = (id: string, data) =>
  post(`/openstack-volumes/${id}/retype/`, data);

export const updateSnapshot = (id: string, data) =>
  put(`/openstack-snapshots/${id}/`, data);

export const restoreSnapshot = (id: string, data) =>
  post(`/openstack-snapshots/${id}/restore/`, data);

export const updateBackup = (id: string, data) =>
  put(`/openstack-backups/${id}/`, data);

export const destroyBackup = (id: string) =>
  deleteById('/openstack-backups/', id);

export const restoreBackup = (id: string, data: BackupRestoreRequestBody) =>
  post(`/openstack-backups/${id}/restore/`, data);

export const createBackup = (id: string, data) =>
  post(`/openstack-instances/${id}/backup/`, data);

export const createSnapshot = (id: string, data) =>
  post(`/openstack-volumes/${id}/snapshot/`, data);

export const pullVolume = (id: string) =>
  post(`/openstack-volumes/${id}/pull/`);

export const detachVolume = (id: string) =>
  post(`/openstack-volumes/${id}/detach/`);

export const createBackupSchedule = (id: string, data) =>
  post(`/openstack-instances/${id}/create_backup_schedule/`, data);

export const attachVolume = (volumeId, instanceUrl) =>
  post(`/openstack-volumes/${volumeId}/attach/`, {
    instance: instanceUrl,
  });

export const createSnapshotSchedule = (id: string, data) =>
  post(`/openstack-volumes/${id}/create_snapshot_schedule/`, data);

export const updateBackupSchedule = (id: string, data) =>
  put(`/openstack-backup-schedules/${id}/`, data);

export const activateBackupSchedule = (id: string) =>
  post(`/openstack-backup-schedules/${id}/activate/`);

export const deactivateBackupSchedule = (id: string) =>
  post(`/openstack-backup-schedules/${id}/deactivate/`);

export const destroyBackupSchedule = (id: string) =>
  deleteById('/openstack-backup-schedules/', id);

export const updateSnapshotSchedule = (id: string, data) =>
  put(`/openstack-snapshot-schedules/${id}/`, data);

export const destroySnapshotSchedule = (id: string) =>
  deleteById('/openstack-snapshot-schedules/', id);

export const activateSnapshotSchedule = (id: string) =>
  post(`/openstack-snapshot-schedules/${id}/activate/`);

export const deactivateSnapshotSchedule = (id: string) =>
  post(`/openstack-snapshot-schedules/${id}/deactivate/`);
