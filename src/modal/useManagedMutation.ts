import {
  InvalidateQueryFilters,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ReactNode } from 'react';

import { useModal } from '@/modal/hooks';
import { useNotify } from '@/store/notify';

import { ConfirmationOptions } from './actions';

export interface MutationConfirmationConfig<TVariables> {
  title: ReactNode | ((variables: TVariables) => ReactNode);
  body: ReactNode | ((variables: TVariables) => ReactNode);
  options?: ConfirmationOptions;
}

export interface ManagedMutationProps<
  TData,
  TError,
  TVariables,
> extends UseMutationOptions<TData, TError, TVariables> {
  successMessage?: string;
  errorMessage?: string;
  refetch?: () => void | Promise<void>;
  invalidateQueries?: Array<InvalidateQueryFilters>;
  confirmation?: MutationConfirmationConfig<TVariables>;
  closeModal?: boolean;
}

/**
 * A custom hook that wraps TanStack Query's `useMutation` to standardize modal form submission workflows.
 */
export function useManagedMutation<TData, TError, TVariables>({
  successMessage,
  errorMessage,
  refetch,
  onSuccess,
  onError,
  confirmation,
  invalidateQueries,
  closeModal = true,
  ...options
}: ManagedMutationProps<TData, TError, TVariables>) {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog, confirm } = useModal();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      if (successMessage) showSuccess(successMessage);

      const asyncTasks: Promise<any>[] = [];

      if (refetch) {
        const refetchResult = refetch();
        if (refetchResult instanceof Promise) {
          asyncTasks.push(refetchResult);
        }
      }

      if (invalidateQueries && invalidateQueries.length > 0) {
        invalidateQueries.forEach((filters) => {
          asyncTasks.push(queryClient.invalidateQueries(filters));
        });
      }

      if (asyncTasks.length > 0) {
        await Promise.all(asyncTasks);
      }

      if (closeModal) {
        closeDialog();
      }

      if (onSuccess) onSuccess(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      if (errorMessage) showErrorResponse(error, errorMessage);
      if (onError) onError(error, variables, onMutateResult, context);
    },
  });

  const mutate = (variables?: TVariables, mutateOptions?: any) => {
    if (confirmation) {
      const title =
        typeof confirmation.title === 'function'
          ? confirmation.title(variables as TVariables)
          : confirmation.title;
      const body =
        typeof confirmation.body === 'function'
          ? confirmation.body(variables as TVariables)
          : confirmation.body;
      confirm(title, body, confirmation.options)
        .then((confirmationData) => {
          mutation.mutate(
            (confirmationData !== undefined
              ? (confirmationData as any)
              : variables) as TVariables,
            mutateOptions,
          );
        })
        .catch(() => {
          /* User cancelled the dialog, do nothing */
        });
    } else {
      mutation.mutate(variables as TVariables, mutateOptions);
    }
  };

  const mutateAsync = async (
    variables?: TVariables,
    mutateOptions?: any,
  ): Promise<TData | void> => {
    if (confirmation) {
      try {
        const title =
          typeof confirmation.title === 'function'
            ? confirmation.title(variables as TVariables)
            : confirmation.title;
        const body =
          typeof confirmation.body === 'function'
            ? confirmation.body(variables as TVariables)
            : confirmation.body;
        const confirmationData = await confirm(
          title,
          body,
          confirmation.options,
        );
        return await mutation.mutateAsync(
          (confirmationData !== undefined
            ? (confirmationData as any)
            : variables) as TVariables,
          mutateOptions,
        );
      } catch {
        return;
      }
    }
    return await mutation.mutateAsync(variables as TVariables, mutateOptions);
  };

  return {
    ...mutation,
    mutate,
    mutateAsync,
  };
}
