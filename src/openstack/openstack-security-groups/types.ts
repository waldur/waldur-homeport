export interface SecurityGroup {
  url: string;
  uuid: string;
  name: string;
  settings: string;
  description: string;
  rules: Array<{[key: string]: string | number}>;
}

export interface SecurityGroupOption extends SecurityGroup {
  clearableValue?: boolean;
}
