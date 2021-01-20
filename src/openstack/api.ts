import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import {
  getAll,
  put,
  post,
  getSelectData,
  deleteById,
  remove,
  get,
} from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import {
  Flavor,
  FloatingIp,
  Subnet,
  Image,
  SshKey,
  OpenStackInstance,
} from '@waldur/openstack/openstack-instance/types';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';

import {
  AvailabilityZone,
  EthernetType,
  SecurityGroupDirection,
  SecurityGroupProtocol,
  VolumeType,
} from './types';

export interface BackupRestoreRequestBody {
  flavor: string;
  internal_ips_set: {
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
  cidr: string;
  remote_group?: string;
  description?: string;
}

export interface CreateSecurityGroupRequestBody {
  name: string;
  description?: string;
  rules: CreateSecurityGroupRuleRequestBody[];
}

export interface UpdateInternalIpsRequestBody {
  internal_ips_set: {
    subnet: string;
  }[];
}

export interface UpdateSecurityGroupsRequestBody {
  security_groups: {
    url: string;
  }[];
}

export interface CreateNetworkRequestBody {
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

export const destroySubnet = (id: string) =>
  deleteById('/openstack-subnets/', id);

export const pullSecurityGroup = (id: string) =>
  post(`/openstack-security-groups/${id}/pull/`);

export const destroySecurityGroup = (id: string) =>
  deleteById('/openstack-security-groups/', id);

export const pullNetwork = (id: string) =>
  post(`/openstack-networks/${id}/pull/`);

export const destroyNetwork = (id: string) =>
  deleteById('/openstack-networks/', id);

export const pullSnapshot = (id: string) =>
  post(`/openstacktenant-snapshots/${id}/pull/`);

export const destroySnapshot = (id: string) =>
  deleteById('/openstacktenant-snapshots/', id);

export const pullInstance = (id: string) =>
  post(`/openstacktenant-instances/${id}/pull/`);

export const startInstance = (id: string) =>
  post(`/openstacktenant-instances/${id}/start/`);

export const stopInstance = (id: string) =>
  post(`/openstacktenant-instances/${id}/stop/`);

export const restartInstance = (id: string) =>
  post(`/openstacktenant-instances/${id}/restart/`);

export const loadFlavors = (settings_uuid: string) =>
  getAll<Flavor>('/openstacktenant-flavors/', { params: { settings_uuid } });

export const loadImages = (settings_uuid: string) =>
  getAll<Image>('/openstacktenant-images/', { params: { settings_uuid } });

export const loadSecurityGroups = (settings_uuid: string) =>
  getAll<SecurityGroup>('/openstacktenant-security-groups/', {
    params: { settings_uuid },
  });

export const loadSecurityGroupsResources = (params?) =>
  getAll<SecurityGroup>('/openstack-security-groups/', { params });

export const updateSecurityGroup = (id: string, data) =>
  put(`/openstack-security-groups/${id}`, data);

export const setSecurityGroupRules = (id: string, data) =>
  post(`/openstack-security-groups/${id}/set_rules/`, data);

export const loadVolumeAvailabilityZones = (settings_uuid: string) =>
  getAll<AvailabilityZone>('/openstacktenant-volume-availability-zones/', {
    params: { settings_uuid },
  });

export const loadVolumeTypes = (settings_uuid: string) =>
  getAll<VolumeType>('/openstacktenant-volume-types/', {
    params: { settings_uuid },
  });

export const loadInstanceAvailabilityZones = (settings_uuid: string) =>
  getAll<AvailabilityZone>('/openstacktenant-instance-availability-zones/', {
    params: { settings_uuid },
  });

export const loadSubnets = (settings_uuid: string) =>
  getAll<Subnet>('/openstacktenant-subnets/', { params: { settings_uuid } });

export const loadFloatingIps = (settings_uuid: string) =>
  getAll<FloatingIp>('/openstacktenant-floating-ips/', {
    params: {
      is_booked: 'False',
      free: 'True',
      settings_uuid,
    },
  });

export const setFloatingIps = (id: string, data) =>
  post(`/openstacktenant-instances/${id}/update_floating_ips/`, data);

export const getInstanceConsoleUrl = (id: string) =>
  get<{ url: string }>(`/openstacktenant-instances/${id}/console/`).then(
    (response) => response.data.url,
  );

export const getInstanceConsoleLog = (id: string) =>
  get<string>(`/openstacktenant-instances/${id}/console_log/`).then(
    (response) => response.data,
  );

export const updateInternalIps = (
  id: string,
  data: UpdateInternalIpsRequestBody,
) => post(`/openstacktenant-instances/${id}/update_internal_ips_set/`, data);

export const updateSecurityGroups = (
  id: string,
  data: UpdateSecurityGroupsRequestBody,
) => post(`/openstacktenant-instances/${id}/update_security_groups/`, data);

export const loadSshKeys = (user_uuid: string) =>
  getAll<SshKey>('/keys/', { params: { user_uuid } });

export const loadSshKeysOptions = async (
  user_uuid: string,
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const response = await getSelectData<SshKey>('/keys/', {
    user_uuid,
    name: query,
    page: currentPage,
    page_size: ENV.pageSize,
  });
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

export const loadServiceSettings = (scope: string) =>
  Axios.get(scope).then((response) => response.data);

export const loadInstances = () =>
  getAll<OpenStackInstance>('/openstacktenant-instances/');

export const getFlavors = (params) =>
  getAll<Flavor>('/openstacktenant-flavors/', { params });

export const getSubnets = (params) =>
  getAll<Subnet>('/openstacktenant-subnets/', { params });

export const getVolumeTypes = (params) =>
  getAll<VolumeType>('/openstacktenant-volume-types/', { params });

export const getInstances = (params) =>
  getAll<OpenStackInstance>('/openstacktenant-instances/', {
    params,
  });

export const updateTenant = (id: string, data) =>
  put(`/openstack-tenants/${id}/`, data);

export const createSecurityGroup = (
  id: string,
  data: CreateSecurityGroupRequestBody,
) => post(`/openstack-tenants/${id}/create_security_group/`, data);

export const createNetwork = (id: string, data: CreateNetworkRequestBody) =>
  post(`/openstack-tenants/${id}/create_network/`, data);

export const pullTenantSecurityGroups = (id: string) =>
  post(`/openstack-tenants/${id}/pull_security_groups/`);

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
  put(`/openstacktenant-instances/${id}/`, data);

export const changeFlavor = (id: string, data: ChangeFlavorRequestBody) =>
  post(`/openstacktenant-instances/${id}/change_flavor/`, data);

export const destroyInstance = (id: string, params: DestroyInstanceParams) =>
  deleteById('/openstacktenant-instances/', id, { params });

export const forceDestroyInstance = (
  id: string,
  params: DestroyInstanceParams,
) => remove(`/openstacktenant-instances/${id}/force_destroy/`, { params });

export const updateVolume = (id: string, data) =>
  put(`/openstacktenant-volumes/${id}/`, data);

export const retypeVolume = (id: string, data) =>
  put(`/openstacktenant-volumes/${id}/retype/`, data);

export const updateSnapshot = (id: string, data) =>
  put(`/openstacktenant-snapshots/${id}/`, data);

export const restoreSnapshot = (id: string, data) =>
  post(`/openstacktenant-snapshots/${id}/restore/`, data);

export const updateBackup = (id: string, data) =>
  put(`/openstacktenant-backups/${id}/`, data);

export const destroyBackup = (id: string) =>
  deleteById('/openstacktenant-backups/', id);

export const restoreBackup = (id: string, data: BackupRestoreRequestBody) =>
  post(`/openstacktenant-backups/${id}/restore/`, data);

export const createBackup = (id: string, data) =>
  post(`/openstacktenant-instances/${id}/backup/`, data);

export const createSnapshot = (id: string, data) =>
  post(`/openstacktenant-volumes/${id}/snapshot/`, data);

export const pullVolume = (id: string) =>
  post(`/openstacktenant-volumes/${id}/pull/`);

export const detachVolume = (id: string) =>
  post(`/openstacktenant-volumes/${id}/detach/`);

export const destroyVolume = (id: string) =>
  deleteById('/openstacktenant-volumes/', id);

export const createBackupSchedule = (id: string, data) =>
  post(`/openstacktenant-instances/${id}/create_backup_schedule/`, data);

export const attachVolume = (volumeId, instanceUrl) =>
  post(`/openstacktenant-volumes/${volumeId}/attach/`, {
    instance: instanceUrl,
  });

export const createSnapshotSchedule = (id: string, data) =>
  post(`/openstacktenant-volumes/${id}/create_snapshot_schedule/`, data);

export const updateBackupSchedule = (id: string, data) =>
  put(`/openstacktenant-backup-schedules/${id}/`, data);

export const activateBackupSchedule = (id: string) =>
  post(`/openstacktenant-backup-schedules/${id}/activate/`);

export const deactivateBackupSchedule = (id: string) =>
  post(`/openstacktenant-backup-schedules/${id}/deactivate/`);

export const destroyBackupSchedule = (id: string) =>
  deleteById('/openstacktenant-backup-schedules/', id);

export const updateSnapshotSchedule = (id: string, data) =>
  put(`/openstacktenant-snapshot-schedules/${id}/`, data);

export const destroySnapshotSchedule = (id: string) =>
  deleteById('/openstacktenant-snapshot-schedules/', id);

export const activateSnapshotSchedule = (id: string) =>
  post(`/openstacktenant-snapshot-schedules/${id}/activate/`);

export const deactivateSnapshotSchedule = (id: string) =>
  post(`/openstacktenant-snapshot-schedules/${id}/deactivate/`);
