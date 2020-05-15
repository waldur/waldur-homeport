import Axios from 'axios';

import { getAll } from '@waldur/core/api';
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

export const loadServiceSettings = (scope: string) =>
  Axios.get(scope).then(response => response.data);

export const loadInstances = () =>
  getAll<OpenStackInstance>('/openstacktenant-instances/');

export const getFlavors = params =>
  getAll<Flavor>('/openstacktenant-flavors/', { params });

export const getSubnets = params =>
  getAll<Subnet>('/openstacktenant-subnets/', { params });

export const getVolumeTypes = params =>
  getAll<VolumeType>('/openstacktenant-volume-types/', { params });

export const getInstances = params =>
  getAll<OpenStackInstance>('/openstacktenant-instances/', {
    params,
  });
