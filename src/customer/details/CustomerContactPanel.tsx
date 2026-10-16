import { FC } from 'react';
import { customersContact } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatPhoneNumber } from '@/core/utils';
import { validateEmails } from '@/core/validators';
import {
  CommaSeparatedListEditField,
  EditFieldProvider,
  EmailEditField,
  StringEditField,
  TextEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
import { useSetCustomer, useUser } from '@/workspace/hooks';

import { CustomerEditPanelProps } from './types';
import { serializeEmailList } from './utils';

const EMAIL_LIST_FIELDS = ['notification_emails', 'invoice_emails'];

export const CustomerContactPanel: FC<CustomerEditPanelProps> = ({
  customer,
}) => {
  const user = useUser();
  const setCustomer = useSetCustomer();
  const { showError } = useNotify();

  const canUpdate =
    hasPermission(user, {
      permission: PermissionEnum.CUSTOMER_CONTACT_UPDATE,
      customerId: customer.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_CUSTOMER,
      customerId: customer.uuid,
    });

  const { mutateAsync: updateContact } = useManagedMutation({
    mutationFn: (formData: Record<string, any>) => {
      const body = { ...formData };
      for (const field of EMAIL_LIST_FIELDS) {
        if (!(field in formData)) continue;
        // Surface a bad email through the notification system before hitting
        // the API, so the user gets the exact offending address back.
        const emailError = validateEmails(formData[field]);
        if (emailError) {
          showError(emailError);
          return Promise.reject(new Error(emailError));
        }
        body[field] = serializeEmailList(formData[field]);
      }
      return customersContact({ path: { uuid: customer.uuid }, body });
    },
    successMessage: translate('Organization updated successfully'),
    // The contact endpoint returns only the contact fields, so merge them onto
    // the current customer instead of replacing the whole workspace customer.
    onSuccess: (response) => {
      setCustomer({ ...customer, ...response.data });
    },
    closeModal: false,
  });

  // Invoice recipients only matter where invoices are emailed. Staff can send
  // an invoice by hand regardless, and a list that is already set is still
  // used for those sends, so it must stay visible to whoever can clear it.
  const showInvoiceEmails =
    ENV.plugins?.WALDUR_INVOICES?.SEND_CUSTOMER_INVOICES ||
    user?.is_staff ||
    Boolean(customer.invoice_emails);

  return (
    <FormTable.Card className="card-bordered">
      <EditFieldProvider scope={customer} callback={updateContact}>
        <FormTable hideActions={!canUpdate}>
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
          {showInvoiceEmails && (
            <CommaSeparatedListEditField
              name="invoice_emails"
              label={translate('Invoice emails')}
              placeholder={translate(
                'Enter email addresses separated by commas',
              )}
              description={translate(
                'Receive invoices instead of the owners when set',
              )}
            />
          )}
        </FormTable>
      </EditFieldProvider>
    </FormTable.Card>
  );
};
