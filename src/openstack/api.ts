import { getAll, getFirst } from '@waldur/core/api';
import { $http } from '@waldur/core/services';
import { Flavor, FloatingIp, Subnet, Image, SshKey } from '@waldur/openstack/openstack-instance/types';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';

import { AvailabilityZone } from './types';

// tslint:disable:variable-name
export const loadFlavors = (settings_uuid: string) =>
  getAll<Flavor>('/openstacktenant-flavors/', {params: {settings_uuid}});

export const loadImages = (settings_uuid: string) =>
  getAll<Image>('/openstacktenant-images/', {params: {settings_uuid}});

export const loadSecurityGroups = (settings_uuid: string) =>
  getAll<SecurityGroup>('/openstacktenant-security-groups/', {params: {settings_uuid}});

export const loadVolumeAvailabilityZones = (settings_uuid: string) =>
  getAll<AvailabilityZone>('/openstacktenant-volume-availability-zones/', {params: {settings_uuid}});

export const loadInstanceAvailabilityZones = (settings_uuid: string) =>
  getAll<AvailabilityZone>('/openstacktenant-instance-availability-zones/', {params: {settings_uuid}});

export const loadSubnets = (settings_uuid: string) =>
  getAll<Subnet>('/openstacktenant-subnets/', {params: {settings_uuid}});

export const loadFloatingIps = (settings_uuid: string) =>
  getAll<FloatingIp>('/openstacktenant-floating-ips/', {params: {
    is_booked: 'False',
    free: 'True',
    settings_uuid,
  }});

export const loadSshKeys = (user_uuid: string) =>
  getAll<SshKey>('/keys/', {params: {user_uuid}});

export const loadProjectQuotas = (settings_uuid: string, project_uuid: string) =>
  getFirst('/openstacktenant-service-project-link/', {
    settings_uuid,
    project_uuid,
  }).then(data => data.quotas);

export const loadServiceSettings = (scope: string) =>
  $http.get(scope).then(response => response.data);
