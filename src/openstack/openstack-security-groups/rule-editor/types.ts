import { EthernetType } from '@waldur/openstack/types';

export interface Rule {
  port_range?: { min: number; max: number };
  ethertype: EthernetType;
  direction: string;
  protocol: string;
  from_port?: number;
  to_port?: number;
  cidr?: string;
  remote_group?: string;
  description?: string;
}

export interface SecurityGroupRulesFormData {
  rules: Rule[];
}
