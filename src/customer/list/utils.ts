import { DateTime } from 'luxon';

import { Customer } from '@waldur/workspace/types';

const RIGHT_ARROW_STRING = '\u2192';

export const getInitialValuesOfOrganizationUpdateForm = (
  customer: Customer,
) => ({
  name: customer.name,
  uuid: customer.uuid,
  abbreviation: customer.abbreviation,
  division: {
    url: customer.division,
    name: `${customer.division_parent_name} ${RIGHT_ARROW_STRING} ${customer.division_name}`,
  },
  contact_details: customer.contact_details,
  registration_code: customer.registration_code,
  agreement_number: customer.agreement_number,
  sponsor_number: customer.sponsor_number,
  email: customer.email,
  phone_number: customer.phone_number,
  access_subnets: customer.access_subnets,
  homepage: customer.homepage,
  image: customer.image,
  country: {
    value: customer.country,
    display_name: customer.country_name,
  },
  vat_code: customer.vat_code,
  default_tax_percent: customer.default_tax_percent,
});

export const makeAccountingPeriods = (start: DateTime) => {
  let date = DateTime.now().startOf('month');
  const diff = date.diff(start, 'months');
  const choices = [];
  for (let i = 0; i <= diff.months; i++) {
    const month = date.month;
    const year = date.year;
    const label = date.toFormat('MMMM, yyyy');
    choices.push({
      label,
      value: { year, month, current: i === 0 },
    });
    date = date.minus({ months: 1 });
  }
  return choices;
};
