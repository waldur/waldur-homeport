import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { ReactElement } from 'react';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ActionItem } from './ActionItem';
import { validateState } from './base';
import { ActionContext } from './types';
import { useValidators } from './useValidators';

interface PullActionItemProps<T> {
  apiMethod(id: string): Promise<any>;
  resource: T;
  staff?: boolean;
  iconClass?: string;
  as?;
  refetch?;
}

const hasBackendId = (ctx: ActionContext) =>
  ctx.resource.backend_id
    ? undefined
    : translate('Resource does not have backend ID.');

const validators = [validateState('OK', 'ERRED'), hasBackendId];

export const PullActionItem = <
  T extends { uuid?: string; backend_id?: string },
>(
  props: PullActionItemProps<T>,
): ReactElement => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => props.apiMethod(props.resource.uuid),
    successMessage: translate('Synchronisation has been scheduled.'),
    errorMessage: translate('Unable to synchronise resource.'),
    refetch: props.refetch,
  });

  const { tooltip, disabled } = useValidators(validators, props.resource);

  return (
    <ActionItem
      title={translate('Synchronise')}
      action={mutate}
      disabled={disabled || isPending}
      tooltip={tooltip}
      important
      as={props.as}
      staff={props.staff}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
