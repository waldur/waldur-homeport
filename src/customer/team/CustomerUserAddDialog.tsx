import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { UserListOption } from '@waldur/project/team/UserGroup';
import { showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';
import { User } from '@waldur/workspace/types';

import { addCustomerUser, usersAutocomplete } from './api';
import { OwnerExpirationTimeGroup } from './OwnerExpirationTimeGroup';

interface CustomerUserAddFormData {
  user: User;
  expiration_time: Date;
}

interface CustomerUserAddProps {
  resolve: { refreshList };
}

export const CustomerUserAddDialog = reduxForm<
  CustomerUserAddFormData,
  CustomerUserAddProps
>({
  form: 'CustomerUserAddDialog',
})(({ resolve: { refreshList }, submitting, handleSubmit }) => {
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const callback = async (formData: CustomerUserAddFormData) => {
    await addCustomerUser(
      customer.url,
      formData.user.url,
      'owner',
      formData.expiration_time,
    );
    refreshList();
    dispatch(showSuccess('User has been added to organization.'));
    dispatch(closeModalDialog());
  };
  return (
    <form onSubmit={handleSubmit(callback)}>
      <ModalHeader>
        <ModalTitle>{translate('Add owner')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <FormContainer submitting={submitting}>
          <AsyncSelectField
            name="user"
            label={translate('User')}
            placeholder={translate('Select user...')}
            loadOptions={(query, prevOptions, page) =>
              usersAutocomplete({ full_name: query }, prevOptions, page)
            }
            {...reactSelectMenuPortaling()}
            getOptionValue={(option) => option.full_name || option.username}
            getOptionLabel={(option) => option.full_name || option.username}
            components={{ Option: UserListOption }}
            required={true}
          />
          <OwnerExpirationTimeGroup />
        </FormContainer>
      </ModalBody>
      <ModalFooter>
        <SubmitButton
          block={false}
          submitting={submitting}
          label={translate('Save')}
        />
        <CloseDialogButton />
      </ModalFooter>
    </form>
  );
});
