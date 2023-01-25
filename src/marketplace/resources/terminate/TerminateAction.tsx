import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { useModalDialogCallback } from '@waldur/resource/actions/useModalDialogCallback';
import { useValidators } from '@waldur/resource/actions/useValidators';

import { TerminateDialogContainer } from './TerminateDialogContainer';

const validators = [validateState('OK', 'Erred')];

interface TerminateActionProps {
  resource: any;
  dialogSubtitle?: string;
  refetch?(): void;
}

export const useTerminate = ({
  resource,
  dialogSubtitle,
  refetch,
}: {
  resource;
  dialogSubtitle?;
  refetch?(): void;
}) => {
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(
    TerminateDialogContainer,
    null,
    resource,
    null,
    { dialogSubtitle, refetch },
  );
  return {
    title: translate('Terminate'),
    action,
    tooltip,
    disabled,
  };
};

export const TerminateAction: FC<TerminateActionProps> = ({
  resource,
  dialogSubtitle,
  refetch,
}) => {
  const props = useTerminate({ resource, refetch, dialogSubtitle });
  return resource.marketplace_resource_uuid !== null ? (
    <ActionItem {...props} />
  ) : null;
};
