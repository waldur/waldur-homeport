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
  state: ResourceState;
  runtime_state: string;
  uuid?: string;
  url?: string;
  backend_id?: string;
  description?: string;
  service_name?: string;
  service_settings_uuid?: string;
  error_message?: string;
  created?: string;
}

export interface Volume extends BaseResource {
  size: number;
}

export interface VirtualMachine extends BaseResource {
  cores: number;
  disk: number;
  ram: number;
}

export interface Schedule extends BaseResource {
  maximal_number_of_resources: number;
  retention_time: number;
  timezone: string;
  is_active: boolean;
}
