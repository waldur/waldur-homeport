import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useSelector } from 'react-redux';
import { marketplaceProviderOfferingsAddUser } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { usersAutocomplete } from '@waldur/customer/team/utils';
import { SubmitButton } from '@waldur/form';
import { AsyncSelectFieldFinal } from '@waldur/form/AsyncSelectField';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { translate } from '@waldur/i18n';
import { providerOfferingsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RoleEnum } from '@waldur/permissions/enums';
import { useNotify } from '@waldur/store/hooks';
import { getCustomer } from '@waldur/workspace/selectors';

interface OwnProps {
  resolve: {
    /** If no offering is given, will show a selector field for it. */
    offering?;
    refetch;
  };
}

export const OfferingPermissionCreateDialog: FC<OwnProps> = ({
  resolve: { refetch, offering },
}) => {
  const { closeDialog } = useModal();
  const { showErrorResponse } = useNotify();

  const customer = useSelector(getCustomer);

  const saveUser = useCallback(
    async (formData) => {
      const _offering = offering || formData.offering;
      try {
        await marketplaceProviderOfferingsAddUser({
          path: { uuid: _offering.uuid },
          body: {
            role: RoleEnum.OFFERING_MANAGER,
            user: formData.user.uuid,
            expiration_time: formData.expiration_time,
          },
        });
        closeDialog();
        await refetch();
      } catch (error) {
        showErrorResponse(error, translate('Unable to grant permission.'));
      }
    },
    [closeDialog, showErrorResponse, offering, refetch],
  );

  return (
    <Form onSubmit={saveUser}>
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Grant permission')}
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  label={translate('Submit')}
                  submitting={submitting}
                  disabled={invalid}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <FormGroup label={translate('User')} required>
              <AsyncSelectFieldFinal
                name="user"
                placeholder={translate('Select user...')}
                loadOptions={(query, prevOptions, page) =>
                  usersAutocomplete({ full_name: query }, prevOptions, page)
                }
                getOptionLabel={({ full_name, email }) => full_name || email}
                validate={required}
              />
            </FormGroup>

            {!offering && (
              <FormGroup label={translate('Offering')} required>
                <AsyncSelectFieldFinal
                  name="offering"
                  placeholder={translate('Select offering...')}
                  loadOptions={(query, prevOptions, page) =>
                    providerOfferingsAutocomplete(
                      { name: query, shared: true, customer: customer.url },
                      prevOptions,
                      page,
                    )
                  }
                  getOptionLabel={({ name }) => name}
                  validate={required}
                />
              </FormGroup>
            )}

            <FormGroup label={translate('Expiration time')}>
              <Field
                name="expiration_time"
                component={DateTimeField as any}
                placeholder={translate('Select a date')}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
