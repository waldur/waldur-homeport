import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { ENV } from '@/core/config';
import { formatDate } from '@/core/dateUtils';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import {
  BooleanEditField,
  DateEditField,
  EditFieldProvider,
  NumberEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import { CustomerEditPanelProps } from './types';

const EU_COUNTRIES = [
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'HU',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK',
];

// Mirrors waldur_core.structure.vies.is_eu_vat_code: only these numbers are
// checked in VIES, so only they can be shown as unverified.
const isEuVatCode = (vatCode: string, country?: string) => {
  const code = vatCode.replace(/[\s.-]/g, '').toUpperCase();
  const prefix = /^[A-Z]{2}/.test(code)
    ? code.slice(0, 2)
    : (country || '').toUpperCase();
  return EU_COUNTRIES.includes(prefix === 'EL' ? 'GR' : prefix);
};

const VatCodeValue: FC<{
  value: string;
  country?: string;
  verified: boolean;
}> = ({ value, country, verified }) => (
  <>
    {value}
    {ENV.plugins.WALDUR_CORE?.VAT_TAXATION_ENABLED &&
      isEuVatCode(value, country) &&
      (verified ? (
        <Badge variant="success" tone="outline" className="ml-2">
          {translate('Verified in VIES')}
        </Badge>
      ) : (
        <Badge variant="warning" tone="outline" className="ml-2">
          {translate('Not verified')}
        </Badge>
      ))}
  </>
);

const VatRateValue: FC<{ customer: CustomerEditPanelProps['customer'] }> = ({
  customer,
}) =>
  customer.vat_percent === null ? (
    <span className="text-danger">{customer.vat_rule}</span>
  ) : (
    <>
      {`${Number(customer.vat_percent)}%`}
      <div className="text-quaternary text-xs">{customer.vat_rule}</div>
    </>
  );

export const CustomerBillingPanel: FC<CustomerEditPanelProps> = (props) => {
  return (
    <EditFieldProvider scope={props.customer} callback={props.callback}>
      <FormTable.Card
        title={translate('Details')}
        className="card-bordered mb-5"
      >
        <FormTable hideActions={!props.canUpdate}>
          <DateEditField
            name="accounting_start_date"
            label={translate('Accounting start date')}
            renderValue={(v) => formatDate(v)}
            isStaffOnly
          />
          {isFeatureVisible(CustomerFeatures.show_banking_data) && (
            <StringEditField name="bank_name" label={translate('Bank name')} />
          )}
          {isFeatureVisible(CustomerFeatures.show_banking_data) && (
            <StringEditField
              name="bank_account"
              label={translate('Bank account')}
            />
          )}
        </FormTable>
      </FormTable.Card>

      <FormTable.Card title={translate('Tax')} className="card-bordered">
        <FormTable hideActions={!props.canUpdate}>
          <StringEditField
            name="vat_code"
            label={translate('VAT code')}
            description={
              ENV.plugins.WALDUR_CORE?.VAT_TAXATION_ENABLED
                ? translate(
                    'EU VAT numbers are checked in the EU VIES system. Only a verified number is invoiced without VAT.',
                  )
                : undefined
            }
            renderValue={(value) =>
              value ? (
                <VatCodeValue
                  value={value}
                  country={props.customer.country}
                  verified={props.customer.vat_code_verified}
                />
              ) : null
            }
          />
          <BooleanEditField
            name="is_private_person"
            label={translate('Private person')}
            description={translate(
              'The organization is a private person rather than a company. Used for EU VAT calculation.',
            )}
            isStaffOnly
          />
          {ENV.plugins.WALDUR_CORE?.VAT_TAXATION_ENABLED ? (
            <FormTable.Item
              label={translate('Tax percentage')}
              description={translate(
                'Calculated from EU VAT rules using the country, VAT code and private person setting. It cannot be changed manually.',
              )}
              value={<VatRateValue customer={props.customer} />}
            />
          ) : (
            <NumberEditField
              name="default_tax_percent"
              label={translate('Tax percentage')}
              unit="%"
              min={0}
              max={200}
              isStaffOnly
            />
          )}
        </FormTable>
      </FormTable.Card>
    </EditFieldProvider>
  );
};
