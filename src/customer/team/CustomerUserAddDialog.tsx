import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { addCustomerUser } from '@waldur/permissions/api';
import { RoleEnum } from '@waldur/permissions/enums';
import { formatRole } from '@waldur/permissions/utils';
import { UserListOption } from '@waldur/project/team/UserGroup';
import { showSuccess } from '@waldur/store/notify';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getCustomer, getUser } from '@waldur/workspace/selectors';
import { User } from '@waldur/workspace/types';

import { usersAutocomplete } from './api';
import { OwnerExpirationTimeGroup } from './OwnerExpirationTimeGroup';

interface CustomerUserAddFormData {
  user: User;
  expiration_time: Date;
}

interface CustomerUserAddProps {
  resolve: { refetch };
}

export const CustomerUserAddDialog = reduxForm<
  CustomerUserAddFormData,
  CustomerUserAddProps
>({
  form: 'CustomerUserAddDialog',
})(({ resolve: { refetch }, submitting, handleSubmit }) => {
  const customer = useSelector(getCustomer);
  const currentUser = useSelector(getUser);
  const dispatch = useDispatch();
  const callback = async (formData: CustomerUserAddFormData) => {
    await addCustomerUser({
      customer: customer.uuid,
      user: formData.user.uuid,
      role: RoleEnum.CUSTOMER_OWNER,
      expiration_time: formData.expiration_time,
    });
    if (currentUser.uuid === formData.user.uuid) {
      const newUser = await getCurrentUser();
      dispatch(setCurrentUser(newUser));
    }
    refetch();
    dispatch(showSuccess('User has been added to organization.'));
    dispatch(closeModalDialog());
  };
  return (
    <form onSubmit={handleSubmit(callback)}>
      <Modal.Header>
        <Modal.Title>
          {translate('Add {role}', {
            role: formatRole(RoleEnum.CUSTOMER_OWNER),
          })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormContainer submitting={submitting}>
          <AsyncSelectField
            name="user"
            label={translate('User')}
            placeholder={translate('Select user...')}
            loadOptions={(query, prevOptions, page) =>
              usersAutocomplete({ full_name: query }, prevOptions, page)
            }
            getOptionValue={(option) => option.full_name || option.username}
            getOptionLabel={(option) => option.full_name || option.username}
            components={{ Option: UserListOption }}
            required={true}
          />
          <OwnerExpirationTimeGroup />
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton
          block={false}
          submitting={submitting}
          label={translate('Save')}
        />
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
