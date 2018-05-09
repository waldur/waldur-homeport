import { BaseResource } from '@waldur/resource/types';

export interface OpenStackTenant extends BaseResource {
  extra_configuration?: {
    package_uuid?: string;
  };
  external_network_id?: string;
}
