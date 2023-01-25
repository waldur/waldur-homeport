import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateStaffAction } from '@waldur/marketplace/resources/actions/utils';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';
import { useModalDialogCallback } from '@waldur/resource/actions/useModalDialogCallback';
import { useValidators } from '@waldur/resource/actions/useValidators';

const SetLimitsDialog = lazyComponent(
  () => import('./SetLimitsDialog'),
  'SetLimitsDialog',
);

const validators = [validateState('OK'), validateStaffAction];

export const useSetLimits = ({ resource, refetch }) => {
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(SetLimitsDialog, null, resource, {
    refetch,
  });
  return {
    title: translate('Set limits'),
    action,
    tooltip,
    disabled,
  };
};

export const SetLimitsAction: ActionItemType = ({ resource, refetch }) => {
  const buttonProps = useSetLimits({ resource, refetch });
  return <ActionItem {...buttonProps} />;
};
