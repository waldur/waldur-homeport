export type ResourceState =
  | 'OK'
  | 'Erred'
  | 'Creation Scheduled'
  | 'Creating'
  | 'Update Scheduled'
  | 'Updating'
  | 'Deletion Scheduled'
  | 'Deleting';

export interface BaseResource {
  name: string;
  state: ResourceState;
  runtime_state: string;
  uuid: string;
  url?: string;
  backend_id?: string;
  description?: string;
  service_name?: string;
  service_settings_uuid?: string;
  error_message?: string;
  created?: string;
  modified?: string;
  marketplace_offering_uuid?: boolean;
  marketplace_resource_uuid?: string;
  marketplace_category_uuid?: string;
  project_uuid?: string;
}

export interface Resource extends BaseResource {
  resource_type: string;
  service_settings_state: string;
  service_settings_error_message?: string;
  error_message?: string;
  action?: string;
  action_details?: {
    message: string;
  };
}

export interface Volume extends Resource {
  size: number;
  bootable: boolean;
  instance?: string;
  source_snapshot?: string;
  service_uuid?: string;
}

export interface FixedIP {
  ip_address: string;
  subnet_id: string;
}

interface SubnetReference {
  subnet: string;
  subnet_uuid: string;
  subnet_name: string;
  subnet_description: string;
  subnet_cidr: string;
}

export interface InternalIP extends Partial<SubnetReference> {
  fixed_ips?: FixedIP[];
  allowed_address_pairs?: any;
  mac_address?: string;
}

export interface VirtualMachine extends Resource {
  internal_ips_set?: InternalIP[];
  cores: number;
  disk: number;
  ram: number;
}

export interface Schedule extends Resource {
  maximal_number_of_resources: number;
  retention_time: number;
  next_trigger_at: string;
  timezone: string;
  is_active: boolean;
}
