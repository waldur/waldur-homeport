import { Resource } from '@waldur/resource/types';

type GuestPowerState =
  | 'Running'
  | 'Shutting down'
  | 'Resetting'
  | 'Standby'
  | 'Not running'
  | 'Unavailable';

export interface VMwareVirtualMachine extends Resource {
  guest_power_state: GuestPowerState;
  guest_os_name: string;
  template_name?: string;
  cluster_name?: string;
  datastore_name?: string;
}
