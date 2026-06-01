import { FC } from 'react';
import { Form } from 'react-final-form';
import { marketplaceOfferingRolesPartialUpdate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormValues {
  name: string;
  description?: string;
}
interface EditRoleResolve {
  row: { uuid: string; name: string; description?: string };
  refetch(): void;
}

export const EditRoleDialog: FC<{ resolve: EditRoleResolve }> = ({
  resolve,
}) => {
  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (formData) =>
      marketplaceOfferingRolesPartialUpdate({
        path: { uuid: resolve.row.uuid },
        body: {
          name: formData.name,
          description: formData.description || '',
        },
      }),
    successMessage: translate('Role has been updated.'),
    errorMessage: translate('Unable to update role.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) =>
        mutation.mutateAsync(values).catch(() => {
          /* error handled by useManagedMutation */
        })
      }
      initialValues={{
        name: resolve.row.name,
        description: resolve.row.description || '',
      }}
    >
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit role')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  label={translate('Save')}
                  submitting={submitting}
                  disabled={invalid}
                  className="btn btn-primary"
                />
              </>
            }
          >
            <StringGroup
              name="name"
              validate={required}
              label={translate('Name')}
              required
            />
            <StringGroup
              name="description"
              placeholder={translate('Role description')}
              label={translate('Description')}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
