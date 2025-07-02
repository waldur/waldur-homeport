import { PlusCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useCallback } from 'react';
import { Form } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import { reset, SubmissionError } from 'redux-form';
import { customersAddUser, customersCreate } from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RoleEnum } from '@waldur/permissions/enums';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';

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
  const dispatch = useDispatch();
  const user = useSelector(getUser);
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
        dispatch(showSuccess(translate('Organization has been created.')));
        const newUser = await getCurrentUser();
        dispatch(setCurrentUser(newUser));
        router.stateService.go('organization-manage', {
          uuid: customer.uuid,
        });
        dispatch(reset('CustomerCreateDialog'));
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Could not create organization')),
        );
        if (e.status === 400) {
          throw new SubmissionError(e.data);
        }
      }
    },
    [dispatch, router, user, resolve.role],
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
