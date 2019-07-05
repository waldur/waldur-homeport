import { fetchTenantOptions, fetchInstanceOptions } from './api';

export const OracleOfferingTypes = ['oracle-iaas', 'oracle-paas'];

export const isOracleOffering = offering => OracleOfferingTypes.indexOf(offering.type) !== -1;

export const loadTenantOptions = customerId => () => {
  return fetchTenantOptions({customerId});
};

export const loadInstanceOptions = customerId => () => {
  return fetchInstanceOptions({customerId});
};
