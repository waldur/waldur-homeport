export interface Quota {
  name: string;
  limit: number;
  usage: number;
  limitType?: string;
  required?: number;
}

export interface AvailabilityZone {
  url: string;
  name: string;
}

export interface VolumeType {
  url: string;
  name: string;
  description: string;
  is_default: boolean;
}

export interface SecurityGroupRule {
  ethertype: 'IPv4' | 'IPv6';
  direction: 'ingress' | 'egress';
  id: number;
  protocol: string;
  from_port: number;
  to_port: number;
  cidr: string;
  remote_group_name?: string;
  remote_group_uuid?: string;
  description?: string;
}
