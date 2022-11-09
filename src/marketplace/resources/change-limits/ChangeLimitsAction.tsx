import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { useModalDialogCallback } from '@waldur/resource/actions/useModalDialogCallback';
import { useValidators } from '@waldur/resource/actions/useValidators';

const ChangeLimitsDialog = lazyComponent(
  () => import('./ChangeLimitsDialog'),
  'ChangeLimitsDialog',
);

const validators = [validateState('OK')];

export const useChangeLimits = ({ resource }) => {
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(ChangeLimitsDialog, 'xl', resource);
  return {
    title: translate('Change limits'),
    action,
    tooltip,
    disabled,
    iconClass: 'fa-edit',
  };
};

export const ChangeLimitsAction = ({ resource, ...rest }) => {
  const buttonProps = useChangeLimits({ resource });
  return resource.is_limit_based ? (
    <ActionItem {...buttonProps} {...rest} />
  ) : null;
};
