import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';

import { Provider } from '../types';
import { ProviderDataItem } from './ProviderDataItem';

interface ProviderDataProps extends TranslateProps {
  provider: Provider;
}

export const ProviderData: React.SFC<ProviderDataProps> = (props: ProviderDataProps) => (
  <div className="provider-data">
    <h2 className="font-bold m-b-lg">
      {props.provider.name}
    </h2>
    <ProviderDataItem
      label={props.translate('Native name')}
      value={props.provider.native_name}
    />
    <ProviderDataItem
      label={props.translate('Organization type')}
      value={props.provider.type}
    />
    <ProviderDataItem
      label={props.translate('Contact email')}
      value={props.provider.email}
    />
    <ProviderDataItem
      label={props.translate('Contact phone')}
      value={props.provider.phone_number}
    />
    <ProviderDataItem
      label={props.translate('Registration code')}
      value={props.provider.registration_code}
    />
    <ProviderDataItem
      label={props.translate('Country')}
      value={props.provider.country}
    />
    <ProviderDataItem
      label={props.translate('Address')}
      value={props.provider.address}
    />
    <ProviderDataItem
      label={props.translate('Postal code')}
      value={props.provider.postal}
    />
    <ProviderDataItem
      label={props.translate('Bank name')}
      value={props.provider.bank_name}
    />
    <ProviderDataItem
      label={props.translate('Bank account')}
      value={props.provider.bank_account}
    />
    <ProviderDataItem
      label={props.translate('EU VAT ID')}
      value={props.provider.vat_code}
    />
    <hr/>
    <h3 className="font-bold m-b-md">
      {props.translate('Offerings')}:
    </h3>
  </div>
);
