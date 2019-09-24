import { Resource } from '@waldur/resource/types';

import { Quota } from '../types';

export interface OpenStackTenant extends Resource {
  internal_network_id?: string;
  external_network_id?: string;
  access_url?: string;
  user_username?: string;
  user_password?: string;
  quotas: Quota[];
  marketplace_offering_name?: string;
}
