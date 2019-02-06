import { AzureResource } from '../types';

export interface AzureVirtualMachine extends AzureResource {
  username: string;
  password: string;
  size_name: string;
  image_name: string;
}
