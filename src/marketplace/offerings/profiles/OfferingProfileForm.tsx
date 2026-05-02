import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  marketplaceOfferingProfilesCreate,
  marketplaceOfferingProfilesPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { FormGroup } from '../FormGroup';

interface FormResolve {
  profile?: { uuid: string; name: string; description?: string };
  refetch(): void;
}

export const OfferingProfileForm: FC<{ resolve: FormResolve }> = ({
  resolve,
}) => {
  const dispatch = useDispatch();
  const isEdit = !!resolve.profile;

  const submit = useCallback(
    async (values) => {
      try {
        if (isEdit) {
          await marketplaceOfferingProfilesPartialUpdate({
            path: { uuid: resolve.profile!.uuid },
            body: { name: values.name, description: values.description || '' },
          });
          dispatch(showSuccess(translate('Profile updated.')));
        } else {
          await marketplaceOfferingProfilesCreate({
            body: {
              name: values.name,
              description: values.description || '',
            } as any,
          });
          dispatch(showSuccess(translate('Profile created.')));
        }
        if (resolve.refetch) await resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            isEdit
              ? translate('Unable to update profile.')
              : translate('Unable to create profile.'),
          ),
        );
      }
    },
    [dispatch, resolve, isEdit],
  );

  return (
    <Form
      onSubmit={submit}
      initialValues={
        resolve.profile
          ? {
              name: resolve.profile.name,
              description: resolve.profile.description || '',
            }
          : undefined
      }
    >
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit service profile')
                : translate('Create service profile')
            }
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={isEdit ? translate('Save') : translate('Create')}
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
                placeholder={translate(
                  'e.g. Rancher cluster, SLURM allocation',
                )}
              />
            </FormGroup>
            <FormGroup label={translate('Description')}>
              <Field
                name="description"
                component={StringField as any}
                placeholder={translate('Describe what this profile covers')}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
