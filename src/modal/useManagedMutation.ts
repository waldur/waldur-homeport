import {
  InvalidateQueryFilters,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ReactNode, useCallback } from 'react';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { ConfirmationOptions } from './actions';

interface MutationConfirmationConfig<TVariables> {
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
  /** Optional secondary line shown under the success title. */
  successDescription?: string;
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
  successDescription,
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

      if (successMessage) {
        if (successDescription) {
          showSuccess(successMessage, successDescription);
        } else {
          showSuccess(successMessage);
        }
      }
      if (onSuccess) onSuccess(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      if (errorMessage) showErrorResponse(error, errorMessage);
      if (onError) onError(error, variables, onMutateResult, context);
    },
  });

  // `mutate` and `mutateAsync` are wrapped in useCallback so consumers can pass
  // them through useEffect / useCallback dep arrays without spurious refires.
  //
  // Deps notes:
  // - `mutation.mutate` and `mutation.mutateAsync` are bound to the
  //   MutationObserver in TanStack Query's `useMutation` and are stable for
  //   the component's lifetime. The outer `mutation` object, by contrast, is
  //   recreated on every state transition (idle -> pending -> success). So
  //   we depend on the bound methods directly, not on the wrapping object.
  // - `confirm` is stable thanks to memoised `useModal` (sister fix in
  //   MR !6793).
  // - `confirmation` is the caller's prop. If the caller passes an inline
  //   object literal, the wrapper is recomputed each render and the
  //   stability promise is defeated for that callsite -- callers should
  //   memoise non-trivial confirmation configs themselves.
  const mutate = useCallback(
    (variables?: TVariables, mutateOptions?: any) => {
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
    },
    [confirmation, confirm, mutation.mutate],
  );

  const mutateAsync = useCallback(
    async (
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
    },
    [confirmation, confirm, mutation.mutateAsync],
  );

  // No `useMemo` wrapper around the return: spreading `mutation` allocates a
  // fresh object on every state transition anyway (TanStack Query's observer
  // emits a new result object per #updateResult), so memoisation can't deliver
  // a stable hook-result reference. `mutate` and `mutateAsync` themselves
  // ARE stable (see deps notes above), which is what consumers actually need
  // for useEffect / useCallback dep arrays.
  return {
    ...mutation,
    mutate,
    mutateAsync,
  };
}
