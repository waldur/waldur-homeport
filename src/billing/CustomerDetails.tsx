import * as React from 'react';

import { Customer } from '@waldur/customer/types';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { formatPhone, normalizeCustomerDetails } from './filters';

interface CustomerDetailsProps extends TranslateProps {
  customer: Customer;
}

export const PureCustomerDetails = (props: CustomerDetailsProps) => {
  const customer = normalizeCustomerDetails(props.customer);
  return (
    <address>
      <div><strong>{customer.name}</strong></div>

      {customer.address && (
        <div>{customer.address}</div>
      )}

      {customer.country && customer.postal && (
        <div>{customer.country}, {customer.postal}</div>
      )}

      {customer.phone_number && (
        <div>
          <abbr title={props.translate('Phone')}>P:</abbr>
          {' '}{formatPhone(customer.phone_number)}
        </div>
      )}

      {customer.bank_name && customer.bank_account && (
        <div>{customer.bank_name}, {customer.bank_account}</div>
      )}

      {customer.vat_code && (
        <div>
          <abbr>{props.translate('VAT')}:</abbr>
          {' '}{customer.vat_code}
        </div>
      )}

      {customer.email}
    </address>
  );
};

export const CustomerDetails = withTranslation(PureCustomerDetails);

export default connectAngularComponent(CustomerDetails, ['customer']);
