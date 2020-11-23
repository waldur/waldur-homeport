import Axios from 'axios';

import { getAll, put, post, getSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
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

import { AvailabilityZone, VolumeType } from './types';

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

export const updateTenant = (id, data) =>
  put(`/openstack-tenants/${id}/`, data);

export const updateNetwork = (id, data) =>
  put(`/openstack-networks/${id}/`, data);

export const updateSubnet = (id, data) =>
  put(`/openstack-subnets/${id}/`, data);

export const createSubnet = (id, data) =>
  post(`/openstack-networks/${id}/create_subnet/`, data);

export const setNetworkMtu = (id, mtu) =>
  post(`/openstack-networks/${id}/set_mtu/`, { mtu });

export const updateInstance = (id, data) =>
  put(`/openstacktenant-instances/${id}/`, data);

export const updateVolume = (id, data) =>
  put(`/openstacktenant-volumes/${id}/`, data);

export const updateSnapshot = (id, data) =>
  put(`/openstacktenant-snapshots/${id}/`, data);

export const restoreSnapshot = (id, data) =>
  post(`/openstacktenant-snapshots/${id}/restore/`, data);

export const updateBackup = (id, data) =>
  put(`/openstacktenant-backups/${id}/`, data);

export const createBackup = (id, data) =>
  post(`/openstacktenant-instances/${id}/backup/`, data);

export const createSnapshot = (id, data) =>
  post(`/openstacktenant-volumes/${id}/snapshot/`, data);

export const createBackupSchedule = (id, data) =>
  post(`/openstacktenant-instances/${id}/create_backup_schedule/`, data);

export const createSnapshotSchedule = (id, data) =>
  post(`/openstacktenant-volumes/${id}/create_snapshot_schedule/`, data);

export const updateBackupSchedule = (id, data) =>
  put(`/openstacktenant-backup-schedules/${id}/`, data);

export const updateSnapshotSchedule = (id, data) =>
  put(`/openstacktenant-snapshot-schedules/${id}/`, data);
