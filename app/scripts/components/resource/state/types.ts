export interface Resource {
  state: string;
  runtime_state: string;
  resource_type: string;
  service_settings_state: string;
  service_settings_error_message?: string;
  error_message?: string;
  action?: string;
  action_details?: {
    message: string
  };
}

export interface StateIndicator {
  className: string;
  label: string;
  movementClassName: string;
  tooltip?: string;
}

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
