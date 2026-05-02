import { ClockIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceResourceProjectsDeleteUser,
  marketplaceResourceProjectsUpdateUser,
  marketplaceResourcesDeleteUser,
  marketplaceResourcesUpdateUser,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { formatJsxTemplate, translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import { ActionItem } from '@/resource/actions/ActionItem';

type RoleScope = 'resource' | 'resource_project';

const resolveScope = (row): RoleScope =>
  row.scope_type === 'resource_project' ? 'resource_project' : 'resource';

export const DeleteUserAction: FC<{ row; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const apiFn =
        resolveScope(row) === 'resource_project'
          ? marketplaceResourceProjectsDeleteUser
          : marketplaceResourcesDeleteUser;
      return apiFn({
        path: { uuid: row.scope_uuid },
        body: { user: row.user_uuid, role: row.role_name } as any,
      });
    },
    successMessage: translate('User has been removed.'),
    errorMessage: translate('Unable to remove user.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to remove {name} from this scope?',
        {
          name: <b>{row.user_full_name || row.user_username}</b>,
        },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionItem
      title={translate('Remove')}
      action={() => deleteMutation.mutate()}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      disabled={deleteMutation.isPending}
    />
  );
};

const UpdateUserExpirationDialog: FC<{
  resolve: { row; refetch(): void };
}> = ({ resolve }) => {
  const updateMutation = useManagedMutation<
    any,
    any,
    { expiration_time: string }
  >({
    mutationFn: (values) => {
      const apiFn =
        resolveScope(resolve.row) === 'resource_project'
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

export const UpdateUserExpirationAction: FC<{ row; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Update expiration')}
      iconNode={<ClockIcon weight="bold" />}
      action={() =>
        openDialog(UpdateUserExpirationDialog, {
          resolve: { row, refetch },
          size: 'sm',
        })
      }
    />
  );
};
