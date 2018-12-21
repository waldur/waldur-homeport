import { getAll, getFirst } from '@waldur/core/api';
import { $http } from '@waldur/core/services';
import { Flavor, FloatingIp, Subnet, ServiceComponent, SshKey } from '@waldur/openstack/openstack-instance/types';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';

// tslint:disable-next-line:variable-name
export const loadFlavors = (settings_uuid: string) =>
  getAll<Flavor>('/openstacktenant-flavors/', {params: {settings_uuid}});

// tslint:disable-next-line:variable-name
export const loadImages = (settings_uuid: string) =>
  getAll<ServiceComponent>('/openstacktenant-images/', {params: {settings_uuid}});

// tslint:disable-next-line:variable-name
export const loadSecurityGroups = (settings_uuid: string) =>
  getAll<SecurityGroup>('/openstacktenant-security-groups/', {params: {settings_uuid}});

// tslint:disable-next-line:variable-name
export const loadSubnets = (settings_uuid: string) =>
  getAll<Subnet>('/openstacktenant-subnets/', {params: {settings_uuid}});

// tslint:disable-next-line:variable-name
export const loadFloatingIps = (settings_uuid: string) =>
  getAll<FloatingIp>('/openstacktenant-floating-ips/', {params: {
    is_booked: 'False',
    free: 'True',
    settings_uuid,
  }});

// tslint:disable-next-line:variable-name
export const loadSshKeys = (user_uuid: string) =>
  getAll<SshKey>('/keys/', {params: {user_uuid}});

// tslint:disable-next-line:variable-name
export const loadProjectQuotas = (settings_uuid: string, project_uuid: string) =>
  getFirst('/openstacktenant-service-project-link/', {
    params: {
      settings_uuid,
      project_uuid,
    },
  }).then(data => data.quotas);

export const loadServiceSettings = (scope: string) =>
  $http.get(scope).then(response => response.data);
