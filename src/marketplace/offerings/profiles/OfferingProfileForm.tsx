import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceOfferingProfilesCreate,
  marketplaceOfferingProfilesPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormResolve {
  profile?: { uuid: string; name: string; description?: string };
  refetch(): void;
}

export const OfferingProfileForm: FC<{ resolve: FormResolve }> = ({
  resolve,
}) => {
  const isEdit = !!resolve.profile;

  const mutation = useManagedMutation<any, any, any>({
    mutationFn: (values) => {
      if (isEdit) {
        return marketplaceOfferingProfilesPartialUpdate({
          path: { uuid: resolve.profile!.uuid },
          body: { name: values.name, description: values.description || '' },
        });
      } else {
        return marketplaceOfferingProfilesCreate({
          body: {
            name: values.name,
            description: values.description || '',
          },
        });
      }
    },
    successMessage: isEdit
      ? translate('Profile updated.')
      : translate('Profile created.'),
    errorMessage: isEdit
      ? translate('Unable to update profile.')
      : translate('Unable to create profile.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) =>
        mutation.mutateAsync(values).catch(() => {
          /* error handled by useManagedMutation */
        })
      }
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
            <StringGroup
              name="name"
              validate={required}
              placeholder={translate('e.g. Rancher cluster, SLURM allocation')}
              label={translate('Name')}
              required
            />
            <StringGroup
              name="description"
              placeholder={translate('Describe what this profile covers')}
              label={translate('Description')}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
