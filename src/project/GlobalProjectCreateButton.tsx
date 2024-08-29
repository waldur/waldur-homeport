import { PlusCircle } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

import { createProject } from './api';

const ProjectCreateDialog = lazyComponent(
  () => import('./ProjectCreateDialog'),
  'ProjectCreateDialog',
);

export const GlobalProjectCreateButton: FC<{ refetch }> = ({ refetch }) => {
  const user = useSelector(getUser);
  const disabled =
    !user.is_staff &&
    user.permissions
      .filter((perm) => perm.scope_type === 'customer')
      .every(
        (perm) =>
          !hasPermission(user, {
            permission: PermissionEnum.CREATE_PROJECT,
            customerId: perm.scope_uuid,
          }),
      );
  const dispatch = useDispatch();
  const router = useRouter();
  if (disabled) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Add')}
      action={() =>
        dispatch(
          openModalDialog(ProjectCreateDialog, {
            size: 'lg',
            formId: 'projectCreate',
            onSubmit: async (formData) => {
              try {
                const response = await createProject(formData);
                await refetch();
                dispatch(showSuccess(translate('Project has been created.')));
                dispatch(closeModalDialog());
                router.stateService.go('project.dashboard', {
                  uuid: response.data.uuid,
                });
              } catch (e) {
                dispatch(
                  showErrorResponse(e, translate('Unable to create project.')),
                );
              }
            },
            initialValues: null,
          }),
        )
      }
      iconNode={<PlusCircle />}
      variant="primary"
    />
  );
};
