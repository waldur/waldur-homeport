import { AzureResource } from '../types';

export interface AzureVirtualMachine extends AzureResource {
  username: string;
  password: string;
  size_name: string;
  image_name: string;
  internal_ips: string[];
  external_ips: string[];
}

export interface AzureSQLServer extends AzureResource {
  username: string;
  password: string;
  fqdn?: string;
  storage_mb?: number;
}

export interface AzureSQLDatabase extends AzureResource {
  server_name: string;
  server_uuid: string;
  charset: string;
  collation: string;
}

export interface Option {
  name: string;
  url: string;
}

export interface Size extends Option {
  max_data_disk_count: number;
  memory_in_mb: number;
  number_of_cores: number;
  os_disk_size_in_mb: number;
  resource_disk_size_in_mb: number;
}

export interface Image extends Option {
  publisher: string;
  sku: string;
}
