import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { marketplaceProviderOfferingsAddUser } from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { translate } from '@waldur/i18n';
import { providerOfferingsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RoleEnum } from '@waldur/permissions/enums';
import { showErrorResponse } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { usersAutocomplete } from '../../customer/team/utils';

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
        await marketplaceProviderOfferingsAddUser({
          path: { uuid: formData.offering.uuid },
          body: {
            role: RoleEnum.OFFERING_MANAGER,
            user: formData.user.uuid,
            expiration_time: formData.expiration_time,
          },
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

          <AsyncSelectField
            name="offering"
            label={translate('Offering')}
            placeholder={translate('Select offering...')}
            loadOptions={(query, prevOptions, page) =>
              providerOfferingsAutocomplete(
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
      </ModalDialog>
    </form>
  );
});
