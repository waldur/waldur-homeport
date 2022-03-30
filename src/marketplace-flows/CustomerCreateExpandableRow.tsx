import { Container } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const CustomerCreateExpandableRow = ({ row }) => (
  <Container>
    <Field label={translate('Name')} value={row.name} />
    <Field
      label={translate('Organization native name')}
      value={row.native_name}
    />
    <Field
      label={translate('Organization abbreviation')}
      value={row.abbreviation}
    />
    <Field label={translate('Contact details')} value={row.contact_details} />
    <Field
      label={translate('Agreement details')}
      value={row.agreement_number}
    />
    <Field
      label={translate('External ID of the sponsor covering the costs')}
      value={row.sponsor_number}
    />
    <Field label={translate('Email address')} value={row.email} />
    <Field label={translate('Phone number')} value={row.phone_number} />
    <Field
      label={translate(
        'List of IPv4 or IPv6 CIDR addresses from where connection to self-service is allowed',
      )}
      value={row.access_subnets}
    />
    <Field
      label={translate('Registration code')}
      value={row.registration_code}
    />
    <Field label={translate('Homepage URL')} value={row.homepage} />
    <Field label={translate('Organization domain')} value={row.domain} />
    <Field label={translate('Legal address')} value={row.address} />
    <Field label={translate('Postal code')} value={row.postal} />
    <Field
      label={translate('Bank name (for accounting)')}
      value={row.bank_name}
    />
    <Field label={translate('Bank account number')} value={row.bank_account} />
  </Container>
);
