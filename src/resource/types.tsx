export type ResourceState =
  | 'OK'
  | 'Erred'
  | 'Creation Scheduled'
  | 'Creating'
  | 'Update Scheduled'
  | 'Updating'
  | 'Deletion Scheduled'
  | 'Deleting'
  ;

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
  marketplace_offering_uuid?: boolean;
}

export interface Resource extends BaseResource {
  resource_type: string;
  service_settings_state: string;
  service_settings_error_message?: string;
  error_message?: string;
  action?: string;
  action_details?: {
    message: string
  };
}

export interface Volume extends Resource {
  size: number;
  bootable: boolean;
  instance?: string;
  source_snapshot?: string;
  service_uuid?: string;
}

export interface VirtualMachine extends Resource {
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
