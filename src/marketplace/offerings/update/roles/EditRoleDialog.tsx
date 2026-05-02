import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { marketplaceOfferingRolesPartialUpdate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

interface EditRoleResolve {
  row: { uuid: string; name: string; description?: string };
  refetch(): void;
}

export const EditRoleDialog: FC<{ resolve: EditRoleResolve }> = ({
  resolve,
}) => {
  const dispatch = useDispatch();

  const submit = useCallback(
    async (formData) => {
      try {
        await marketplaceOfferingRolesPartialUpdate({
          path: { uuid: resolve.row.uuid },
          body: {
            name: formData.name,
            description: formData.description || '',
          } as any,
        });
        dispatch(showSuccess(translate('Role has been updated.')));
        if (resolve.refetch) await resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to update role.')));
      }
    },
    [dispatch, resolve],
  );

  return (
    <Form
      onSubmit={submit}
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
