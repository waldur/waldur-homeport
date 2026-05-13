import { ClockIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceResourceProjectsUpdateUser,
  marketplaceResourcesUpdateUser,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';

export const UpdateUserExpirationDialog: FC<{
  resolve: { row; refetch(): void };
}> = ({ resolve }) => {
  const updateMutation = useManagedMutation<
    any,
    any,
    { expiration_time: string }
  >({
    mutationFn: (values) => {
      const apiFn =
        resolve.row.scope_type === 'resource_project'
          ? marketplaceResourceProjectsUpdateUser
          : marketplaceResourcesUpdateUser;
      return apiFn({
        path: { uuid: resolve.row.scope_uuid },
        body: {
          user: resolve.row.user_uuid,
          role: resolve.row.role_name,
          expiration_time: values.expiration_time || null,
        } as any,
      });
    },
    successMessage: translate('Role expiration updated.'),
    errorMessage: translate('Unable to update role.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values: { expiration_time: string }) =>
        updateMutation.mutateAsync(values).catch(() => {
          /* error handled by useManagedMutation */
        })
      }
      initialValues={{ expiration_time: resolve.row.expiration_time }}
    >
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update role expiration')}
            iconNode={<ClockIcon weight="bold" />}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  label={translate('Save')}
                  submitting={submitting}
                  className="btn btn-primary"
                />
              </>
            }
          >
            <ExpirationTimeGroup disabled={submitting} />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
