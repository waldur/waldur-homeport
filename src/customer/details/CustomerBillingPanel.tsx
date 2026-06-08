import { FC } from 'react';

import { formatDate } from '@/core/dateUtils';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import {
  DateEditField,
  EditFieldProvider,
  NumberEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import { CustomerEditPanelProps } from './types';

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
          <StringEditField name="vat_code" label={translate('VAT code')} />
          <NumberEditField
            name="default_tax_percent"
            label={translate('Tax percentage')}
            unit="%"
            min={0}
            max={200}
            isStaffOnly
          />
        </FormTable>
      </FormTable.Card>
    </EditFieldProvider>
  );
};
