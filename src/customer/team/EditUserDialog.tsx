import { useCallback, FC } from 'react';
import { Form } from 'react-final-form';
import { useSelector } from 'react-redux';
import {
  customersAddUser,
  customersDeleteUser,
  customersUpdateUser,
  CustomerUser,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { Role } from '@/permissions/types';
import { getCustomerRoles } from '@/permissions/utils';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@/project/team/RoleGroup';
import { useNotify } from '@/store/hooks';
import { getCustomer } from '@/workspace/selectors';
import { Customer } from '@/workspace/types';

import { UserGroup } from './UserGroup';

interface EditUserDialogFormData {
  role: Role;
  expiration_time: string;
}

interface EditUserDialogResolve {
  customer: CustomerUser;
  refetch();
}

interface EditUserDialogProps {
  resolve: EditUserDialogResolve;
}

const savePermissions = async (
  customer: Customer,
  formData: EditUserDialogFormData,
  resolve: EditUserDialogResolve,
) => {
  if (resolve.customer) {
    if (resolve.customer.role_name === formData.role.name) {
      await customersUpdateUser({
        path: { uuid: customer.uuid },
        body: {
          user: resolve.customer.uuid,
          role: formData.role.name,
          expiration_time: formData.expiration_time,
        },
      });
    } else {
      if (resolve.customer.role_name) {
        await customersDeleteUser({
          path: { uuid: customer.uuid },
          body: {
            user: resolve.customer.uuid,
            role: resolve.customer.role_name,
          },
        });
      }
      await customersAddUser({
        path: { uuid: customer.uuid },
        body: {
          user: resolve.customer.uuid,
          role: formData.role.name,
          expiration_time: formData.expiration_time,
        },
      });
    }
  }
  await resolve.refetch();
};

export const EditUserDialog: FC<EditUserDialogProps> = ({ resolve }) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const currentCustomer = useSelector(getCustomer);

  const initialValues = {
    role: getCustomerRoles().find(
      ({ name }) => name === resolve.customer.role_name,
    ),
    expiration_time: resolve.customer.expiration_time,
  };

  const saveUser = useCallback(
    async (formData: EditUserDialogFormData) => {
      try {
        await savePermissions(currentCustomer, formData, resolve);
        showSuccess(translate('Permission has been updated.'));
        closeDialog();
      } catch (error) {
        showErrorResponse(error, translate('Unable to update permission.'));
      }
    },
    [currentCustomer, resolve, showSuccess, showErrorResponse, closeDialog],
  );

  return (
    <Form onSubmit={saveUser} initialValues={initialValues}>
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit organization member')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton disabled={invalid} submitting={submitting}>
                  {translate('Save')}
                </SubmitButton>
              </>
            }
          >
            <UserGroup permission={resolve.customer} />
            <RoleGroup types={['customer']} />
            <ExpirationTimeGroup disabled={submitting} />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
