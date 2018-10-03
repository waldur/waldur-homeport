import { BaseResource } from '@waldur/resource/types';

export interface OpenStackTenant extends BaseResource {
  extra_configuration?: {
    package_uuid?: string;
  };
  internal_network_id?: string;
  external_network_id?: string;
  access_url?: string;
  user_username?: string;
  user_password?: string;
}
