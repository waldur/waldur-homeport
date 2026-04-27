import { XCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { useModalDialogCallback } from '@/resource/actions/useModalDialogCallback';
import { useValidators } from '@/resource/actions/useValidators';
import { useUser } from '@/workspace/hooks';

import { ResourceAction } from '../actions/constants';

const TerminateDialog = lazyComponent(() =>
  import('./TerminateDialog').then((module) => ({
    default: module.TerminateDialog,
  })),
);

const validators = [validateState('OK', 'ERRED', 'Erred')];

interface TerminateActionProps {
  resource: any;
  refetch?(): void;
}

export const TerminateAction: FC<TerminateActionProps> = ({
  resource,
  refetch,
}) => {
  const user = useUser();
  const { tooltip, disabled } = useValidators(validators, resource);

  if (
    !hasPermission(user, {
      permission: PermissionEnum.TERMINATE_RESOURCE,
      projectId: resource.project_uuid,
      customerId: resource.customer_uuid,
    })
  ) {
    return null;
  }
  const action = useModalDialogCallback(TerminateDialog, resource, {
    refetch,
  });
  const props = {
    title: translate('Terminate'),
    action,
    tooltip,
    disabled,
    className: 'text-danger',
    actionId: ResourceAction.TERMINATE,
    resource,
  };
  return (
    <ActionItem
      {...props}
      iconNode={<XCircleIcon weight="bold" />}
      iconColor="danger"
    />
  );
};
