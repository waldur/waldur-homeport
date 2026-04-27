import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { EditButton } from '@/form/EditButton';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { getUser } from '@/workspace/selectors';

import { UpdateResourceOptionDialogProps } from './UpdateResourceOptionDialog';

const UpdateResourceOptionDialog = lazyComponent(() =>
  import('./UpdateResourceOptionDialog').then((module) => ({
    default: module.UpdateResourceOptionDialog,
  })),
);

export const UpdateResourceOptionButton: FunctionComponent<
  UpdateResourceOptionDialogProps['resolve']
> = (props) => {
  const user = useSelector(getUser);
  const hasPerms = hasPermission(user, {
    permission: PermissionEnum.UPDATE_RESOURCE_OPTIONS,
    projectId: props.resource.project_uuid,
    customerId: props.resource.customer_uuid,
  });
  const isResourceOk = props.resource.state === 'OK';
  const disabled = !hasPerms || !isResourceOk;

  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(UpdateResourceOptionDialog, {
        resolve: props,
      }),
    );
  };

  let tooltip: string | undefined;
  if (disabled) {
    if (!isResourceOk) {
      tooltip = translate(
        'Options cannot be edited while resource is being updated.',
      );
    } else if (!hasPerms) {
      tooltip = translate(
        "You don't have enough privileges to perform this operation.",
      );
    }
  }

  return (
    <EditButton onClick={callback} disabled={disabled} tooltip={tooltip} />
  );
};
