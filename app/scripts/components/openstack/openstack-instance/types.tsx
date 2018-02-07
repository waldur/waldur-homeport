import { VirtualMachine } from '@waldur/resource/types';

export interface OpenStackInstance extends VirtualMachine {
  flavor_name: string;
}
