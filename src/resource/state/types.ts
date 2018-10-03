import { BaseResource } from '@waldur/resource/types';
export { ResourceState } from '@waldur/resource/types';

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

export interface StateIndicator {
  className: string;
  label: string;
  movementClassName: string;
  tooltip: string;
}
