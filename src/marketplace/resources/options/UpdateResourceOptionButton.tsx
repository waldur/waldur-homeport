import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasAllPermissions } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import { UpdateResourceOptionDialogProps } from './UpdateResourceOptionDialog';

const UpdateResourceOptionDialog = lazyComponent(() =>
  import('./UpdateResourceOptionDialog').then((module) => ({
    default: module.UpdateResourceOptionDialog,
  })),
);

export const UpdateResourceOptionButton: FunctionComponent<
  UpdateResourceOptionDialogProps['resolve']
> = (props) => {
  const user = useUser();
  // Some offerings apply option changes through a marketplace order rather
  // than writing them straight to the resource. Those need order creation
  // rights on top of the options permission.
  // A formula input changes limits, so it is always ordered, and its dialog
  // needs the width of the limits table it previews.
  const isFormula = props.option.type === 'component_formula';
  const createsOrder =
    isFormula ||
    Boolean(
      (props.resource.offering_plugin_options as any)
        ?.create_orders_on_resource_option_change,
    );
  const requiredPermissions = createsOrder
    ? [PermissionEnum.UPDATE_RESOURCE_OPTIONS, PermissionEnum.CREATE_ORDER]
    : [PermissionEnum.UPDATE_RESOURCE_OPTIONS];
  const hasPerms = hasAllPermissions(user, requiredPermissions, {
    projectId: props.resource.project_uuid,
    customerId: props.resource.customer_uuid,
  });
  const isResourceOk = props.resource.state === 'OK';
  const disabled = !hasPerms || !isResourceOk;

  const { openDialog } = useModal();
  const callback = () => {
    openDialog(UpdateResourceOptionDialog, {
      resolve: props,
      size: isFormula ? 'xl' : undefined,
    });
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
    <BaseButton
      onClick={callback}
      disabled={disabled}
      tooltip={tooltip}
      iconNode={<PencilSimpleIcon weight="bold" />}
      label={translate('Edit')}
      iconRight
      variant="tertiary"
      size="sm"
    />
  );
};
