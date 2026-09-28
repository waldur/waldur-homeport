import { ReactElement, ReactNode } from 'react';

import { ButtonVariant, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ActionValidator } from './types';
import { useValidators } from './useValidators';

interface AsyncActionButtonProps<T> {
  apiMethod(id: string, data?: any): Promise<any>;
  resource: T;
  validators?: ActionValidator<T>[];
  title: string;
  label?: string;
  actionTitle?: string;
  icon?: string;
  iconNode?: ReactNode;
  className?: string;
  variant?: ButtonVariant;
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
  const label = rest.label ?? rest.title;

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: (variables) => apiMethod(resource.uuid, variables),
    successMessage: translate('Action has been applied.'),
    errorMessage: translate('Unable to apply action.'),
    refetch,
    confirmation: hasConfirmation
      ? {
          title: translate('Confirmation'),
          body: translate('Are you sure you want to {action}?', {
            action: (actionTitle || label || '').toLowerCase(),
          }),
          options: {
            iconNode: rest.iconNode,
            type: 'success',
            ...confirmationOptions,
          },
        }
      : undefined,
  });

  const {
    title: _title,
    label: _label,
    icon: _icon,
    variant,
    ...cleanRest
  } = rest;

  return (
    <BaseButton
      {...cleanRest}
      {...validationState}
      label={label}
      disabled={isPending || validationState.disabled}
      tooltip={
        isPending ? translate('Action is in progress') : validationState.tooltip
      }
      onClick={(variables) => mutate(variables)}
      variant={variant ?? 'tertiary'}
      size="lg"
    />
  );
};
