import { ClockIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  marketplaceResourceProjectsDeleteUser,
  marketplaceResourceProjectsUpdateUser,
  marketplaceResourcesDeleteUser,
  marketplaceResourcesUpdateUser,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { formatJsxTemplate, translate } from '@/i18n';
import {
  closeModalDialog,
  openModalDialog,
  waitForConfirmation,
} from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

type RoleScope = 'resource' | 'resource_project';

const resolveScope = (row): RoleScope =>
  row.scope_type === 'resource_project' ? 'resource_project' : 'resource';

export const DeleteUserAction: FC<{ row; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();
  const handler = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to remove {name} from this scope?',
          {
            name: <b>{row.user_full_name || row.user_username}</b>,
          },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      const apiFn =
        resolveScope(row) === 'resource_project'
          ? marketplaceResourceProjectsDeleteUser
          : marketplaceResourcesDeleteUser;
      await apiFn({
        path: { uuid: row.scope_uuid },
        body: { user: row.user_uuid, role: row.role_name } as any,
      });
      dispatch(showSuccess(translate('User has been removed.')));
      await refetch();
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to remove user.')));
    }
  }, [dispatch, row, refetch]);
  return (
    <ActionItem
      title={translate('Remove')}
      action={handler}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
    />
  );
};

const UpdateUserExpirationDialog: FC<{
  resolve: { row; refetch(): void };
}> = ({ resolve }) => {
  const dispatch = useDispatch();
  const submit = useCallback(
    async (values) => {
      try {
        const apiFn =
          resolveScope(resolve.row) === 'resource_project'
            ? marketplaceResourceProjectsUpdateUser
            : marketplaceResourcesUpdateUser;
        await apiFn({
          path: { uuid: resolve.row.scope_uuid },
          body: {
            user: resolve.row.user_uuid,
            role: resolve.row.role_name,
            expiration_time: values.expiration_time || null,
          } as any,
        });
        dispatch(showSuccess(translate('Role expiration updated.')));
        await resolve.refetch();
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
  const dispatch = useDispatch();
  return (
    <ActionItem
      title={translate('Update expiration')}
      iconNode={<ClockIcon weight="bold" />}
      action={() =>
        dispatch(
          openModalDialog(UpdateUserExpirationDialog, {
            resolve: { row, refetch },
            size: 'sm',
          }),
        )
      }
    />
  );
};
