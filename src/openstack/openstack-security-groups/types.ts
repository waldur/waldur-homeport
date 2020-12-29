import { SecurityGroupRule } from '../types';

export interface SecurityGroup {
  url: string;
  uuid: string;
  name: string;
  settings: string;
  description: string;
  rules: SecurityGroupRule[];
  resource_type?: string;
  tenant?: string;
}

export interface SecurityGroupOption extends SecurityGroup {
  clearableValue?: boolean;
}
