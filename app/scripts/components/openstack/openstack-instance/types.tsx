import { VirtualMachine } from '@waldur/resource/types';

interface InternalIp {
  subnet: string;
}

export interface OpenStackInstance extends VirtualMachine {
  flavor_name: string;
  internal_ips_set: InternalIp[];
  runtime_state: 'SHUTOFF' | 'ACTIVE';
  security_groups?: string[];
}
