import { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { customersContact } from 'waldur-js-client';

import { formatPhoneNumber } from '@waldur/core/utils';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { renderFieldOrDash } from '@waldur/table/utils';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';

import { FieldEditButton } from './FieldEditButton';
import { CustomerEditPanelProps } from './types';

export const CustomerContactPanel: FC<CustomerEditPanelProps> = (props) => {
  const user = useSelector(getUser);
  const canUpdateContact =
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_CUSTOMER,
      customerId: props.customer.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.CUSTOMER_CONTACT_UPDATE,
      customerId: props.customer.uuid,
    });

  const updateContact = useCallback(
    async (formData, dispatch) => {
      try {
        const response = await customersContact({
          path: { uuid: props.customer.uuid },
          body: {
            ...formData,
            notification_emails: Array.isArray(formData.notification_emails)
              ? formData.notification_emails.join(', ')
              : formData.notification_emails,
          } as any,
        });
        dispatch(showSuccess(translate('Organization updated successfully')));
        if (response.data) {
          dispatch(
            setCurrentCustomer({
              ...props.customer,
              ...response.data,
            } as any),
          );
        }
        return response;
      } catch (error) {
        dispatch(showErrorResponse(error));
        throw error;
      }
    },
    [props.customer],
  );

  const rows = useMemo(
    () => [
      {
        label: translate('Email'),
        key: 'email',
        value: props.customer.email,
      },
      {
        label: translate('Phone number'),
        key: 'phone_number',
        value: formatPhoneNumber(props.customer.phone_number),
      },
      {
        label: translate('Contact details'),
        key: 'contact_details',
        value: props.customer.contact_details,
      },
      {
        label: translate('Homepage'),
        key: 'homepage',
        value: props.customer.homepage,
      },
      {
        label: translate('Notification emails'),
        key: 'notification_emails',
        value: Array.isArray(props.customer.notification_emails)
          ? props.customer.notification_emails.join(', ')
          : props.customer.notification_emails,
      },
    ],

    [props.customer],
  );

  return (
    <FormTable.Card className="card-bordered">
      <FormTable>
        {rows.map((row) => (
          <FormTable.Item
            key={row.key}
            label={row.label}
            value={renderFieldOrDash(row.value)}
            actions={
              canUpdateContact ? (
                <FieldEditButton
                  customer={props.customer}
                  name={row.key}
                  callback={updateContact}
                />
              ) : null
            }
          />
        ))}
      </FormTable>
    </FormTable.Card>
  );
};
