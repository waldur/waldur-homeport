import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { ManagedMutationProps } from './useManagedMutation';

interface BatchMutationOptions<T, TVariables = any, TData = any, TError = any> {
  /** The array of items to process in batch. */
  rows: T[];
  /** Optional callback function to refetch data after mutation. */
  refetch?(): void | Promise<void>;
  /** Function to execute for each item. Receives the item and variables from mutate(). */
  mutationFn(row: T, variables: TVariables): Promise<any>;
  /** Message shown when ALL items succeed. Can be a string or a function of variables. */
  successMessage?: string | ((variables: TVariables) => string);
  /** Message shown when SOME items succeed. Receives the success count and variables. */
  renderPartialSuccessMessage?(n: number, variables: TVariables): string;
  /** Static error message shown when items fail (if renderErrorMessage is not provided). */
  errorMessage?: string;
  /** Dynamic error message shown when items fail. Receives the failure count and variables. */
  renderErrorMessage?(n: number, variables: TVariables): string;
  /** Optional configuration for a confirmation dialog to display before executing the mutation. */
  confirmation?: ManagedMutationProps<
    TData,
    TError,
    TVariables
  >['confirmation'];
}

/**
 * A custom hook that wraps useManagedMutation to handle bulk operations.
 * It automatically handles confirmation, batch execution via Promise.allSettled,
 * and reporting of partial successes.
 *
 * Benefits:
 * - Consistency: Uses the same confirmation and notification infrastructure as single mutations.
 * - Robustness: Handles partial failures gracefully using Promise.allSettled.
 * - UX: Standardizes bulk operation confirmation dialogs and loading states.
 * - Developer Experience: Simplifies complex bulk logic into a declarative configuration.
 */
export const useBatchMutation = <
  T extends { uuid?: string },
  TVariables = any,
>({
  rows,
  refetch,
  mutationFn,
  successMessage,
  renderPartialSuccessMessage,
  errorMessage,
  renderErrorMessage,
  confirmation,
}: BatchMutationOptions<T, TVariables>) => {
  const { showSuccess, showErrorResponse } = useNotify();

  return useManagedMutation<any, any, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const promises = rows.map((row) => mutationFn(row, variables));

      const results = await Promise.allSettled(promises);
      const errors = results.filter((res) => res.status === 'rejected');
      const success = results.filter((res) => res.status === 'fulfilled');

      if (errors.length) {
        if (success.length) {
          showSuccess(
            renderPartialSuccessMessage
              ? renderPartialSuccessMessage(success.length, variables)
              : translate('{count} items were processed successfully.', {
                  count: success.length,
                }),
          );
        }
        if (success.length) {
          refetch?.();
        }
        const firstError = (errors[0] as PromiseRejectedResult).reason;
        if (renderErrorMessage) {
          showErrorResponse(
            firstError,
            renderErrorMessage(errors.length, variables),
          );
        }
        throw firstError;
      }
    },
    successMessage:
      typeof successMessage === 'string' ? successMessage : undefined,
    onSuccess: (_data, variables) => {
      if (typeof successMessage === 'function') {
        showSuccess(successMessage(variables));
      }
    },
    errorMessage: renderErrorMessage ? undefined : errorMessage,
    refetch,
    confirmation,
  });
};
