import { Resource } from '@waldur/marketplace/resources/types';

export const isOracleOffering = (resource: Resource) =>
  resource.offering_name.toLowerCase().includes('oracle');
