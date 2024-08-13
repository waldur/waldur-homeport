import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import {
  addCustomerUser,
  deleteCustomerUser,
  updateCustomerUser,
} from '@waldur/permissions/api';
import { Role } from '@waldur/permissions/types';
import { getCustomerRoles } from '@waldur/permissions/utils';
import { ExpirationTimeGroup } from '@waldur/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@waldur/project/team/RoleGroup';
import { showErrorResponse } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { NestedCustomerPermission } from './types';
import { UserGroup } from './UserGroup';

const FORM_ID = 'EditUserDialog';

interface EditUserDialogFormData {
  role: Role;
  expiration_time: string;
}

interface EditUserDialogResolve {
  customer: NestedCustomerPermission;
  refetch;
}

interface EditUserDialogOwnProps {
  resolve: EditUserDialogResolve;
}

const savePermissions = async (
  customer: Customer,
  formData: EditUserDialogFormData,
  resolve: EditUserDialogResolve,
) => {
  if (resolve.customer) {
    if (resolve.customer.role_name === formData.role.name) {
      await updateCustomerUser({
        customer: customer.uuid,
        user: resolve.customer.uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      });
    } else {
      if (resolve.customer.role_name) {
        await deleteCustomerUser({
          customer: customer.uuid,
          user: resolve.customer.uuid,
          role: resolve.customer.role_name,
        });
      }
      await addCustomerUser({
        customer: customer.uuid,
        user: resolve.customer.uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      });
    }
  }
  await resolve.refetch();
};

export const EditUserDialog = connect(
  (_, ownProps: EditUserDialogOwnProps) => ({
    initialValues: {
      role: getCustomerRoles().find(
        ({ name }) => name === ownProps.resolve.customer.role_name,
      ),
      expiration_time: ownProps.resolve.customer.expiration_time,
    },
  }),
)(
  reduxForm<EditUserDialogFormData, EditUserDialogOwnProps>({
    form: FORM_ID,
  })(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();
    const currentCustomer = useSelector(getCustomer);

    const saveUser = useCallback(
      async (formData) => {
        try {
          await savePermissions(currentCustomer, formData, resolve);
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update permission.')),
          );
        }
      },
      [dispatch, resolve],
    );

    return (
      <form onSubmit={handleSubmit(saveUser)}>
        <Modal.Header>
          <Modal.Title>{translate('Edit organization member')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormContainer submitting={submitting}>
            <UserGroup permission={resolve.customer} />
            <RoleGroup types={['customer']} />
            <ExpirationTimeGroup disabled={submitting} />
          </FormContainer>
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton submitting={submitting}>
            {translate('Save')}
          </SubmitButton>
          <CloseDialogButton />
        </Modal.Footer>
      </form>
    );
  }),
);
