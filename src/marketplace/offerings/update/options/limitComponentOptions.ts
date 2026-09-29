import { PublicOfferingDetails } from 'waldur-js-client';

/**
 * The offering's plain limit components as select options. The component
 * options that set a limit (multiplier, formula, sum) all pick from these;
 * prepaid one-time components are priced per period in their own table.
 */
export const getLimitComponentOptions = (offering?: PublicOfferingDetails) =>
  (offering?.components || [])
    .filter((component) => component.billing_type === 'limit')
    .map((component) => ({
      value: component.type,
      label: `${component.name} (${component.type})`,
    }));
