import { FC } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsUpdateUser } from 'waldur-js-client';

import { DateTimeGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const UpdateOfferingPermissionExpirationTimeDialog: FC<{
  resolve: { permission; refetch };
}> = ({ resolve: { permission, refetch } }) => {
  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsUpdateUser({
        path: { uuid: permission.offering_uuid },
        body: {
          user: permission.user_uuid,
          role: permission.role_name,
          expiration_time: formData.expiration_time,
        },
      }),
    successMessage: translate('Permission has been updated successfully.'),
    errorMessage: translate('Unable to update permission.'),
    refetch,
  });

  return (
    <Form
      onSubmit={(values) => updateMutation.mutateAsync(values)}
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
            <DateTimeGroup
              label={translate('Expiration time')}
              name="expiration_time"
              placeholder={translate('Select a date')}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
