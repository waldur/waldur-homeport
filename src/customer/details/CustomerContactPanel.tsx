import { FC } from 'react';

import { formatPhoneNumber } from '@/core/utils';
import {
  CommaSeparatedListEditField,
  EditFieldProvider,
  EmailEditField,
  StringEditField,
  TextEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import { CustomerEditPanelProps } from './types';

export const CustomerContactPanel: FC<CustomerEditPanelProps> = (props) => {
  return (
    <FormTable.Card className="card-bordered">
      <EditFieldProvider scope={props.customer} callback={props.callback}>
        <FormTable hideActions={!props.canUpdate}>
          <EmailEditField name="email" label={translate('Email')} />
          <StringEditField
            name="phone_number"
            label={translate('Phone number')}
            renderValue={(v) => formatPhoneNumber(v)}
          />
          <TextEditField
            name="contact_details"
            label={translate('Contact details')}
          />
          <StringEditField name="homepage" label={translate('Homepage')} />
          <CommaSeparatedListEditField
            name="notification_emails"
            label={translate('Notification emails')}
            placeholder={translate('Enter email addresses separated by commas')}
            description={translate(
              'Email addresses for receiving notifications, separated by commas',
            )}
          />
        </FormTable>
      </EditFieldProvider>
    </FormTable.Card>
  );
};
