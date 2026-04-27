import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateStaffAction } from '@/marketplace/resources/actions/utils';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionItemType } from '@/resource/actions/types';
import { useModalDialogCallback } from '@/resource/actions/useModalDialogCallback';
import { useValidators } from '@/resource/actions/useValidators';

const SetLimitsDialog = lazyComponent(() =>
  import('./SetLimitsDialog').then((module) => ({
    default: module.SetLimitsDialog,
  })),
);

const validators = [validateState('OK'), validateStaffAction];

const useSetLimits = ({ resource, refetch }) => {
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(SetLimitsDialog, resource, {
    refetch,
  });
  return {
    title: translate('Set limits'),
    action,
    tooltip,
    disabled,
    iconNode: <PencilSimpleIcon weight="bold" />,
  };
};

export const SetLimitsAction: ActionItemType = ({ resource, refetch }) => {
  const buttonProps = useSetLimits({ resource, refetch });
  return <ActionItem {...buttonProps} staff />;
};
