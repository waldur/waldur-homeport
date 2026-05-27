import { ReactElement, ReactNode } from 'react';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';

import { ActionValidator } from './types';
import { useValidators } from './useValidators';

interface AsyncActionButtonProps<T> {
  apiMethod(id: string, data?: any): Promise<any>;
  resource: T;
  validators?: ActionValidator<T>[];
  title: string;
  actionTitle?: string;
  icon?: string;
  iconNode?: ReactNode;
  className?: string;
  hasConfirmation?: boolean;
  confirmationOptions?: {
    showRouterSelect?: boolean;
    tenantUuid?: string;
  };
  refetch?(): void;
}

export const AsyncActionButton: <T extends { uuid?: string }>(
  props: AsyncActionButtonProps<T>,
) => ReactElement = ({
  resource,
  apiMethod,
  validators,
  refetch,
  hasConfirmation,
  actionTitle,
  confirmationOptions,
  ...rest
}) => {
  const validationState = useValidators(validators, resource);

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: (variables) => apiMethod(resource.uuid, variables),
    successMessage: translate('Action has been applied.'),
    errorMessage: translate('Unable to apply action.'),
    refetch,
    confirmation: hasConfirmation
      ? {
          title: translate('Confirmation'),
          body: translate('Are you sure you want to {action}?', {
            action: (actionTitle || rest.title).toLowerCase(),
          }),
          options: {
            iconNode: rest.iconNode,
            type: 'success',
            ...confirmationOptions,
          },
        }
      : undefined,
  });
  return (
    <ActionButton
      {...rest}
      {...validationState}
      disabled={isPending || validationState.disabled}
      tooltip={
        isPending ? translate('Action is in progress') : validationState.tooltip
      }
      action={(variables) => mutate(variables)}
    />
  );
};
