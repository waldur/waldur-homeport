import { Offering } from '@waldur/marketplace/types';
import { VirtualMachine, Volume } from '@waldur/resource/types';
import { Project } from '@waldur/workspace/types';

import { SecurityGroup } from '../openstack-security-groups/types';

interface RancherClusterReference {
  uuid: string;
  name: string;
}

export interface OpenStackInstance extends VirtualMachine {
  image_name: string;
  flavor_name: string;
  floating_ips?: FloatingIp[];
  runtime_state: 'SHUTOFF' | 'ACTIVE';
  security_groups?: SecurityGroup[];
  availability_zone_name?: string;
  hypervisor_hostname?: string;
  rancher_cluster?: RancherClusterReference;
  volumes?: Volume[];
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
  subnet?: string;
  subnet_name?: string;
}

interface ServiceComponent {
  cores: number;
  storage: number;
  ram: number;
}

export interface Flavor extends ServiceComponent {
  url: string;
  name: string;
  disabled: boolean;
  display_name?: string;
  disk: number;
}

export interface Image extends ServiceComponent {
  url: string;
  name: string;
}

export interface OpenStackInstanceFormData {
  name?: string;
  service?: { name: string };
  image?: { name: string };
  flavor?: Flavor;
  attributes?: Record<string, any>;
  project?: Project;
  offering?: Offering;
}
