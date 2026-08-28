import { FunctionComponent, useCallback } from 'react';
import { customersPartialUpdate } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
import { useCustomer, useSetCustomer, useUser } from '@/workspace/hooks';

import { serializeNotificationEmails } from './utils';

const CustomerErrorDialog = lazyComponent(() =>
  import('./CustomerErrorDialog').then((module) => ({
    default: module.CustomerErrorDialog,
  })),
);

interface OwnProps {
  tabSpec;
}

export const CustomerManage: FunctionComponent<OwnProps> = ({ tabSpec }) => {
  const setCurrentCustomer = useSetCustomer();
  const { showErrorResponse, showSuccess } = useNotify();
  const { openDialog } = useModal();

  const customer = useCustomer();
  const user = useUser();
  const canEditCustomer = hasPermission(user, {
    permission: PermissionEnum.UPDATE_CUSTOMER,
    customerId: customer.uuid,
  });

  const update = useCallback(
    async (formData) => {
      if (canEditCustomer) {
        try {
          const response = await customersPartialUpdate({
            path: { uuid: customer.uuid },
            body: {
              ...formData,
              ...('notification_emails' in formData && {
                notification_emails: serializeNotificationEmails(
                  formData.notification_emails,
                ),
              }),
              image: fileSerializer(formData.image),
            },
            ...formDataOptions,
          });
          showSuccess(translate('Organization updated successfully'));
          if (response.data?.uuid === customer.uuid) {
            setCurrentCustomer(response.data);
          }
          return response;
        } catch (error) {
          showErrorResponse(error);
          // Throw exception to the edit dialog
          if (!('image' in formData)) {
            throw error;
          }
        }
      } else {
        openDialog(CustomerErrorDialog, {
          resolve: { customer, formData },
        });
      }
    },
    [canEditCustomer, customer, openDialog, showSuccess, showErrorResponse],
  );

  if (!tabSpec) {
    return null;
  }

  return (
    <tabSpec.component
      customer={customer}
      callback={update}
      canUpdate={canEditCustomer}
    />
  );
};
