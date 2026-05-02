import { ReactElement } from 'react';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ActionItem, ActionItemProps } from './ActionItem';
import { ActionValidator } from './types';
import { useValidators } from './useValidators';

export interface AsyncActionItemProps<T> extends Omit<
  ActionItemProps,
  'disabled' | 'action'
> {
  apiMethod(id: string): Promise<any>;
  resource: T;
  validators: ActionValidator<T>[];
  successMessage?: string;
  errorMessage?: string;
  refetch?(): void;
}

export const AsyncActionItem: <T extends { uuid?: string; name?: string }>(
  props: AsyncActionItemProps<T>,
) => ReactElement = ({
  resource,
  apiMethod,
  validators,
  successMessage,
  errorMessage,
  refetch,
  ...rest
}) => {
  const validationState = useValidators(validators, resource);

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => apiMethod(resource.uuid),
    successMessage:
      successMessage ||
      translate('{action} has been scheduled for {resource}.', {
        action: rest.title || translate('Action'),
        resource: resource.name || resource.uuid,
      }),
    errorMessage: errorMessage || translate('Unable to apply action.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to {action}?', {
        action: rest.title ? rest.title.toLowerCase() : translate('action'),
      }),
    },
  });
  return (
    <ActionItem
      {...rest}
      {...validationState}
      disabled={isPending || validationState.disabled}
      action={mutate}
    />
  );
};
