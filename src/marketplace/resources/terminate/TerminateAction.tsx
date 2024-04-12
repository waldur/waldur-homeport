import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { useModalDialogCallback } from '@waldur/resource/actions/useModalDialogCallback';
import { useValidators } from '@waldur/resource/actions/useValidators';

const TerminateDialog = lazyComponent(
  () => import('./TerminateDialog'),
  'TerminateDialog',
);

const validators = [validateState('OK', 'Erred')];

interface TerminateActionProps {
  resource: any;
  refetch?(): void;
}

export const TerminateAction: FC<TerminateActionProps> = ({
  resource,
  refetch,
}) => {
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(TerminateDialog, null, resource, null, {
    refetch,
  });
  const props = {
    title: translate('Terminate'),
    action,
    tooltip,
    disabled,
    className: 'text-danger',
  };
  return <ActionItem {...props} />;
};
