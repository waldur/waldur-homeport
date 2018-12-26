import { Resource } from '@waldur/resource/types';

interface NestedInternalIp {
  ip4_address: string;
  mac_address: string;
  subnet: string;
  subnet_uuid: string;
  subnet_name: string;
  subnet_description: string;
  subnet_cidr: string;
}

interface SecurityGroupRule {
  id: number;
  protocol: string;
  from_port: number;
  to_port: number;
  cidr: string;
}

interface NestedSecurityGroup {
  url: string;
  name: string;
  description: string;
  rukes: SecurityGroupRule[];
}

export interface OpenStackBackup extends Resource {
  instance_security_groups: NestedSecurityGroup[];
  instance_internal_ips_set: NestedInternalIp[];
}
