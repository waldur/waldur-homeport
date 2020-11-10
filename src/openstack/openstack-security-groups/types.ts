import { SecurityGroupRule } from '../types';

export interface SecurityGroup {
  url: string;
  uuid: string;
  name: string;
  settings: string;
  description: string;
  rules: SecurityGroupRule[];
}

export interface SecurityGroupOption extends SecurityGroup {
  clearableValue?: boolean;
}
