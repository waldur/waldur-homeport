import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';
import { useModalDialogCallback } from '@waldur/resource/actions/useModalDialogCallback';
import { useValidators } from '@waldur/resource/actions/useValidators';

const ChangeLimitsDialog = lazyComponent(
  () => import('./ChangeLimitsDialog'),
  'ChangeLimitsDialog',
);

const validators = [validateState('OK')];

export const useChangeLimits = ({ resource, refetch }) => {
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(
    ChangeLimitsDialog,
    'xl',
    resource,
    null,
    { refetch },
  );
  return {
    title: translate('Change limits'),
    action,
    tooltip,
    disabled,
    iconClass: 'fa-edit',
  };
};

export const ChangeLimitsAction: ActionItemType = ({
  resource,
  refetch,
  ...rest
}) => {
  const buttonProps = useChangeLimits({ resource, refetch });
  return (resource.plan_uuid || resource.marketplace_plan_uuid) &&
    resource.is_limit_based ? (
    <ActionItem {...buttonProps} {...rest} />
  ) : null;
};
