import { Resource, Port } from '@waldur/resource/types';

import { SecurityGroupRule } from '../types';

interface NestedSecurityGroup {
  url: string;
  name: string;
  description: string;
  rules: SecurityGroupRule[];
}

export interface OpenStackBackup extends Resource {
  instance_security_groups: NestedSecurityGroup[];
  instance_ports: Port[];
  tenant_uuid: string;
}
