import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { translate } from '@waldur/i18n';
import { offeringsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { addOfferingPermission } from '@waldur/permissions/api';
import { RoleEnum } from '@waldur/permissions/enums';
import { showErrorResponse } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { usersAutocomplete } from '../../customer/team/api';

export const OfferingPermissionCreateDialog = reduxForm<
  {},
  { resolve: { fetch } }
>({
  form: 'OfferingPermissionCreateDialog',
})(({ submitting, handleSubmit, resolve: { fetch } }) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const saveUser = useCallback(
    async (formData) => {
      try {
        await addOfferingPermission({
          role: RoleEnum.OFFERING_MANAGER,
          offering: formData.offering.uuid,
          user: formData.user.uuid,
          expiration_time: formData.expiration_time,
        });
        dispatch(closeModalDialog());
        await fetch();
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to grant permission.')),
        );
      }
    },
    [dispatch, customer],
  );
  return (
    <form onSubmit={handleSubmit(saveUser)}>
      <Modal.Header>
        <Modal.Title>{translate('Grant permission')}</Modal.Title>
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
            getOptionLabel={({ full_name, email }) => full_name || email}
            required={true}
          />
          <AsyncSelectField
            name="offering"
            label={translate('Offering')}
            placeholder={translate('Select offering...')}
            loadOptions={(query, prevOptions, page) =>
              offeringsAutocomplete(
                { name: query, shared: true, customer: customer.url },
                prevOptions,
                page,
              )
            }
            getOptionLabel={({ name }) => name}
            required={true}
          />
          <Field
            name="expiration_time"
            label={translate('Expiration time')}
            component={DateTimeField}
          />
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <CloseDialogButton />
        <SubmitButton submitting={submitting}>
          {translate('Submit')}
        </SubmitButton>
      </Modal.Footer>
    </form>
  );
});
