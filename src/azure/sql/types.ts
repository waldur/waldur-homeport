import { AzureResource } from '../types';

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
