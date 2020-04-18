import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { Customer } from '@waldur/customer/types';
import { translate } from '@waldur/i18n';

interface CustomerSummaryProps {
  customer: Customer;
}

const Row = ({ label, value }) =>
  value ? (
    <tr>
      <td className="col-md-3">
        <strong>{label}</strong>
      </td>
      <td className="col-md-9">{value}</td>
    </tr>
  ) : null;

export const CustomerSummary = ({ customer }: CustomerSummaryProps) => (
  <Table responsive bordered>
    <tbody>
      <Row label={translate('Organization type')} value={customer.type} />
      <Row
        label={translate('Registration code')}
        value={customer.registration_code}
      />
      <Row label={translate('Legal address')} value={customer.address} />
      <Row label={translate('Contact email')} value={customer.email} />
      <Row label={translate('Contact phone')} value={customer.phone_number} />
    </tbody>
  </Table>
);
