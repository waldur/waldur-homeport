import { FC } from 'react';
import { customersContact } from 'waldur-js-client';

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
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useSetCustomer, useUser } from '@/workspace/hooks';

import { CustomerEditPanelProps } from './types';
import { serializeNotificationEmails } from './utils';

export const CustomerContactPanel: FC<CustomerEditPanelProps> = ({
  customer,
}) => {
  const user = useUser();
  const setCustomer = useSetCustomer();

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
    mutationFn: (formData: Record<string, any>) =>
      customersContact({
        path: { uuid: customer.uuid },
        body: {
          ...formData,
          ...('notification_emails' in formData && {
            notification_emails: serializeNotificationEmails(
              formData.notification_emails,
            ),
          }),
        },
      }),
    successMessage: translate('Organization updated successfully'),
    // The contact endpoint returns only the contact fields, so merge them onto
    // the current customer instead of replacing the whole workspace customer.
    onSuccess: (response) => {
      setCustomer({ ...customer, ...response.data });
    },
    closeModal: false,
  });

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
        </FormTable>
      </EditFieldProvider>
    </FormTable.Card>
  );
};
