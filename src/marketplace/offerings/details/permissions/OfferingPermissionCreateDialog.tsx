import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { marketplaceProviderOfferingsAddUser } from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { usersAutocomplete } from '@waldur/customer/team/utils';
import { FormContainer } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RoleEnum } from '@waldur/permissions/enums';
import { showErrorResponse } from '@waldur/store/notify';

export const OfferingPermissionCreateDialog = reduxForm<
  {},
  { resolve: { refetch; offering } }
>({
  form: 'OfferingPermissionCreateDialog',
})(({ submitting, handleSubmit, resolve: { refetch, offering } }) => {
  const dispatch = useDispatch();
  const saveUser = useCallback(
    async (formData) => {
      try {
        await marketplaceProviderOfferingsAddUser({
          path: { uuid: offering.uuid },
          body: {
            role: RoleEnum.OFFERING_MANAGER,
            user: formData.user.uuid,
            expiration_time: formData.expiration_time,
          },
        });
        dispatch(closeModalDialog());
        await refetch();
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to grant permission.')),
        );
      }
    },
    [dispatch, offering, refetch],
  );
  return (
    <form onSubmit={handleSubmit(saveUser)}>
      <ModalDialog
        title={translate('Grant permission')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton submitting={submitting}>
              {translate('Submit')}
            </SubmitButton>
          </>
        }
      >
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

          <Field
            name="expiration_time"
            label={translate('Expiration time')}
            component={DateTimeField}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
