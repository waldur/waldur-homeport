import { PlusCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useCallback } from 'react';
import { Form } from 'react-final-form';
import { customersAddUser, customersCreate } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { RoleEnum } from '@/permissions/enums';
import { useNotify } from '@/store/notify';
import { getCurrentUser } from '@/user/UsersService';
import { useSetUser, useUser } from '@/workspace/hooks';

import * as constants from './constants';
import { CustomerCreateForm } from './CustomerCreateForm';

interface CustomerCreateFormData {
  name: string;
  email: string;
}
interface OwnProps {
  resolve: { role: string };
}

export const CustomerCreateDialog: FC<OwnProps> = ({ resolve }) => {
  const user = useUser();
  const setUser = useSetUser();
  const { showSuccess, showErrorResponse } = useNotify();
  const router = useRouter();

  const createOrganization = useCallback(
    async (formData: CustomerCreateFormData) => {
      try {
        const response = await customersCreate({
          body: formData,
        });
        const customer = response.data;
        if (resolve.role === constants.ROLES.provider) {
          await customersAddUser({
            path: { uuid: customer.uuid },
            body: {
              role: RoleEnum.CUSTOMER_OWNER,
              user: user.uuid,
            },
          });
        }
        showSuccess(translate('Organization has been created.'));
        const newUser = await getCurrentUser();
        setUser(newUser);
        router.stateService.go('organization-manage', {
          uuid: customer.uuid,
        });
      } catch (e) {
        showErrorResponse(e, translate('Could not create organization'));
      }
    },
    [showSuccess, showErrorResponse, setUser, router, user, resolve.role],
  );
  return (
    <Form
      onSubmit={createOrganization}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create an organization')}
            subtitle={translate(
              'Provide the required information to create a new organization.',
            )}
            iconNode={<PlusCircleIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Create')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <CustomerCreateForm />
          </ModalDialog>
        </form>
      )}
    />
  );
};
