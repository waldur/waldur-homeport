import * as React from 'react';

import { Customer } from '@waldur/customer/types';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

interface CustomerSummaryProps extends TranslateProps {
  customer: Customer;
}

const Row = ({ label, value }) => value ? (
  <tr>
    <td className="col-md-3"><strong>{label}</strong></td>
    <td className="col-md-9">{value}</td>
  </tr>
) : null;

export const PureCustomerSummary = ({ customer, translate }: CustomerSummaryProps) => (
  <div className="table-responsive">
    <table className="table table-bordered">
      <tbody>
        <Row
          label={translate('Organization type')}
          value={customer.type}
        />
        <Row
          label={translate('Registration code')}
          value={customer.registration_code}
        />
        <Row
          label={translate('Legal address')}
          value={customer.address}
        />
        <Row
          label={translate('Contact email')}
          value={customer.email}
        />
        <Row
          label={translate('Contact phone')}
          value={customer.phone_number}
        />
      </tbody>
    </table>
  </div>
);

export default connectAngularComponent(withTranslation(PureCustomerSummary), ['customer']);
