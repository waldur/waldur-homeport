import * as React from 'react';

import { Customer } from '@waldur/customer/types';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

interface CustomerDetailsTableProps extends TranslateProps {
  customer: Customer;
}

export const CustomerDetailsTable = withTranslation((props: CustomerDetailsTableProps) => (
  <div className="provider-data">
    <h2 className="font-bold m-b-lg">
      {props.customer.name}
    </h2>
    <dl className="dl-horizontal resource-details-table col-sm-12">
      <Field
        label={props.translate('Native name')}
        value={props.customer.native_name}
      />
      <Field
        label={props.translate('Organization type')}
        value={props.customer.type}
      />
      <Field
        label={props.translate('Contact email')}
        value={props.customer.email}
      />
      <Field
        label={props.translate('Contact phone')}
        value={props.customer.phone_number}
      />
      <Field
        label={props.translate('Registration code')}
        value={props.customer.registration_code}
      />
      <Field
        label={props.translate('Country')}
        value={props.customer.country}
      />
      <Field
        label={props.translate('Address')}
        value={props.customer.address}
      />
      <Field
        label={props.translate('Postal code')}
        value={props.customer.postal}
      />
      <Field
        label={props.translate('Bank name')}
        value={props.customer.bank_name}
      />
      <Field
        label={props.translate('Bank account')}
        value={props.customer.bank_account}
      />
      <Field
        label={props.translate('EU VAT ID')}
        value={props.customer.vat_code}
      />
    </dl>
    <hr/>
    <h3 className="font-bold m-b-md">
      {props.translate('Offerings')}:
    </h3>
  </div>
));
