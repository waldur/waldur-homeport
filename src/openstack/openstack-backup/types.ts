import { Resource } from '@waldur/resource/types';

import { SecurityGroupRule } from '../types';

interface NestedInternalIp {
  ip4_address: string;
  mac_address: string;
  subnet: string;
  subnet_uuid: string;
  subnet_name: string;
  subnet_description: string;
  subnet_cidr: string;
}

interface NestedSecurityGroup {
  url: string;
  name: string;
  description: string;
  rules: SecurityGroupRule[];
}

export interface OpenStackBackup extends Resource {
  instance_security_groups: NestedSecurityGroup[];
  instance_internal_ips_set: NestedInternalIp[];
}
