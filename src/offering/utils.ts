export const OracleOfferingTypes = ['oracle-iaas', 'oracle-paas'];

export const isOracleOffering = offering =>
  OracleOfferingTypes.indexOf(offering.type) !== -1;
