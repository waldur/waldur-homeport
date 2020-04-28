import { VirtualMachine } from '@waldur/resource/types';

interface RancherClusterReference {
  uuid: string;
  name: string;
}

export interface OpenStackInstance extends VirtualMachine {
  flavor_name: string;
  floating_ips?: string[];
  runtime_state: 'SHUTOFF' | 'ACTIVE';
  security_groups?: string[];
  availability_zone_name?: string;
  rancher_cluster?: RancherClusterReference;
}

export interface Subnet {
  url: string;
  uuid: string;
  name: string;
  cidr: string;
  gateway_ip: string;
  allocation_pools: Array<{ [key: string]: string }>;
  ip_version: number;
  enable_dhcp: boolean;
  dns_nameservers: Array<{ [key: string]: string }>;
  network: string;
  network_name?: string;
}

export interface FloatingIp {
  url: string;
  uuid: string;
  settings: string;
  address: string;
  runtime_state: string;
  is_booked: boolean;
}

export interface ServiceComponent {
  cores: number;
  storage: number;
  ram: number;
}

export interface Flavor extends ServiceComponent {
  url: string;
  name: string;
  disabled: boolean;
  display_name?: string;
}

export interface Image extends ServiceComponent {
  url: string;
  name: string;
}

export interface LimitsType {
  cores: string;
  storage: string;
  ram: string;
}

export interface SshKey {
  url: string;
  uuid: string;
  name: string;
  public_key: string;
  fingerprint: string;
  user_uuid: string;
  is_shared: boolean;
}
