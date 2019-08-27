import { Resource } from '@waldur/resource/types';

export interface VMwareVirtualMachine extends Resource {
  guest_power_state: string;
  tools_state: string;
  guest_os_name: string;
  template_name?: string;
  cluster_name?: string;
  datastore_name?: string;
}
