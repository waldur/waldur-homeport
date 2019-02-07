import { AzureResource } from '../types';

export interface AzureVirtualMachine extends AzureResource {
  username: string;
  password: string;
  size_name: string;
  image_name: string;
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
