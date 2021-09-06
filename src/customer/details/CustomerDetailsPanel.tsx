import React from 'react';
import { connect } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ResourceDetailsTable } from '@waldur/resource/summary/ResourceDetailsTable';
import { getNativeNameVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { CustomerAccordion } from './CustomerAccordion';
import { CustomerLogoUpdateContainer } from './CustomerLogoUpdateContainer';

interface CustomerDetailsProps {
  customer: Partial<Customer>;
  nativeNameVisible: boolean;
}

export const PureCustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  nativeNameVisible,
}) => {
  return (
    <CustomerAccordion
      title={translate('Organization details')}
      subtitle={translate(
        'Update your organization name, logo, accounting and contact details.',
      )}
    >
      <ResourceDetailsTable>
        <Field label={translate('Name')} value={customer.display_name} />

        {nativeNameVisible && (
          <Field
            label={translate('Native name')}
            value={customer.native_name}
          />
        )}

        <Field
          label={translate('Abbreviation')}
          value={customer.abbreviation}
        />

        {isFeatureVisible('customer.show_domain') && (
          <Field
            label={translate('Home organization domain name')}
            value={customer.domain}
          />
        )}

        <Field
          label={translate('Registry code')}
          value={customer.registration_code}
        />

        <Field
          label={translate('Accounting start date')}
          value={
            customer.accounting_start_date &&
            formatDateTime(customer.accounting_start_date)
          }
        />

        <Field
          label={translate('Agreement number')}
          value={customer.agreement_number}
        />

        <Field
          label={translate('Address')}
          value={customer.address || customer.contact_details}
        />

        <Field label={translate('Contact email')} value={customer.email} />

        <Field
          label={translate('Contact phone')}
          value={customer.phone_number}
        />

        <Field label={translate('VAT code')} value={customer.vat_code} />

        <Field
          label={translate('VAT rate')}
          value={`${customer.default_tax_percent}%`}
        />

        <Field
          label={translate(
            'Subnets from where connection to self-service is allowed.',
          )}
          value={
            ENV.plugins.WALDUR_CORE.ORGANIZATION_SUBNETS_VISIBLE &&
            customer.access_subnets
          }
        />

        <Field label={translate('Country')} value={customer.country_name} />

        <Field label={translate('Postal code')} value={customer.postal} />

        <Field label={translate('Bank name')} value={customer.bank_name} />

        <Field
          label={translate('Bank account')}
          value={customer.bank_account}
        />
      </ResourceDetailsTable>

      <CustomerLogoUpdateContainer customer={customer} />
    </CustomerAccordion>
  );
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  nativeNameVisible: getNativeNameVisible(state),
});

export const CustomerDetailsPanel = connect(mapStateToProps)(
  PureCustomerDetails,
);
