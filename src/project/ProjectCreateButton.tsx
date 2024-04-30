import { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { createProject } from './actions';

const ProjectCreateDialog = lazyComponent(
  () => import('./ProjectCreateDialog'),
  'ProjectCreateDialog',
);

interface ProjectCreateButtonProps {
  title?: string;
  icon?: string;
  variant?: string;
  className?: string;
}

export const ProjectCreateButton: FC<ProjectCreateButtonProps> = ({
  title = translate('Add project'),
  variant = 'primary',
  icon = 'fa fa-plus',
  className,
}) => {
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  const disabled =
    !customer ||
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT,
      customerId: customer.uuid,
    });
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={title}
      action={() =>
        dispatch(
          openModalDialog(ProjectCreateDialog, {
            size: 'lg',
            onSubmit: (formData) => {
              createProject(formData, dispatch).then(() => {
                dispatch(closeModalDialog());
              });
            },
            onCancel: () => {
              dispatch(closeModalDialog());
            },
            initialValues: null,
          }),
        )
      }
      tooltip={
        disabled
          ? translate(
              "You don't have enough privileges to perform this operation.",
            )
          : undefined
      }
      icon={icon}
      variant={variant}
      disabled={disabled}
      className={className}
    />
  );
};
