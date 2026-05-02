import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { marketplaceOfferingRolesPartialUpdate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface EditRoleResolve {
  row: { uuid: string; name: string; description?: string };
  refetch(): void;
}

export const EditRoleDialog: FC<{ resolve: EditRoleResolve }> = ({
  resolve,
}) => {
  const mutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceOfferingRolesPartialUpdate({
        path: { uuid: resolve.row.uuid },
        body: {
          name: formData.name,
          description: formData.description || '',
        } as any,
      }),
    successMessage: translate('Role has been updated.'),
    errorMessage: translate('Unable to update role.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
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
            <FormGroup label={translate('Name')} required>
              <Field
                name="name"
                validate={required}
                component={StringField as any}
              />
            </FormGroup>
            <FormGroup label={translate('Description')}>
              <Field
                name="description"
                component={StringField as any}
                placeholder={translate('Role description')}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
