import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { marketplaceProviderOfferingsUpdateUser } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { DateTimeField } from '@/form/DateTimeField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';

import { FormGroup } from '../../FormGroup';

export const UpdateOfferingPermissionExpirationTimeDialog: FC<{
  resolve: { permission; refetch };
}> = ({ resolve: { permission, refetch } }) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const update = useCallback(
    async (formData) => {
      try {
        await marketplaceProviderOfferingsUpdateUser({
          path: { uuid: permission.offering_uuid },
          body: {
            user: permission.user_uuid,
            role: permission.role_name,
            expiration_time: formData.expiration_time,
          },
        });

        showSuccess(translate('Permission has been updated successfully.'));
        closeDialog();
        await refetch();
      } catch (error) {
        showErrorResponse(error, translate('Unable to update permission.'));
      }
    },
    [permission, refetch, showSuccess, showErrorResponse, closeDialog],
  );

  return (
    <Form
      onSubmit={update}
      initialValues={{ expiration_time: permission.expiration_time }}
    >
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update permission of {name}', {
              name: permission.offering_name,
            })}
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  label={translate('Update')}
                  submitting={submitting}
                  disabled={invalid}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
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
