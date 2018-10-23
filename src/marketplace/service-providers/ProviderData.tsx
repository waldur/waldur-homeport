import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { Provider } from '../types';

interface ProviderDataProps extends TranslateProps {
  provider: Provider;
}

export const ProviderData = (props: ProviderDataProps) => (
  <div className="provider-data">
    <h2 className="font-bold m-b-lg">
      {props.provider.name}
    </h2>
    <dl className="dl-horizontal resource-details-table col-sm-12">
      <Field
        label={props.translate('Native name')}
        value={props.provider.native_name}
      />
      <Field
        label={props.translate('Organization type')}
        value={props.provider.type}
      />
      <Field
        label={props.translate('Contact email')}
        value={props.provider.email}
      />
      <Field
        label={props.translate('Contact phone')}
        value={props.provider.phone_number}
      />
      <Field
        label={props.translate('Registration code')}
        value={props.provider.registration_code}
      />
      <Field
        label={props.translate('Country')}
        value={props.provider.country}
      />
      <Field
        label={props.translate('Address')}
        value={props.provider.address}
      />
      <Field
        label={props.translate('Postal code')}
        value={props.provider.postal}
      />
      <Field
        label={props.translate('Bank name')}
        value={props.provider.bank_name}
      />
      <Field
        label={props.translate('Bank account')}
        value={props.provider.bank_account}
      />
      <Field
        label={props.translate('EU VAT ID')}
        value={props.provider.vat_code}
      />
    </dl>
    <hr/>
    <h3 className="font-bold m-b-md">
      {props.translate('Offerings')}:
    </h3>
  </div>
);
