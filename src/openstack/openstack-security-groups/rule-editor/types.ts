export interface Rule {
  ethertype: string;
  direction: string;
  protocol: string;
  from_port?: number;
  to_port?: number;
  cidr?: string;
  remote_group?: string;
  description?: string;
}

export interface FormData {
  rules: Rule[];
}
