import { TrashIcon } from '@phosphor-icons/react';
import { ReactNode, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { CompactActionButton } from '@/table/CompactActionButton';

import { DeleteButtonProps } from './types';

/**
 * A generic button factory for delete operations with confirmation.
 *
 * Reduces boilerplate by encapsulating the common pattern of:
 * - Showing a confirmation dialog
 * - Calling the delete API function
 * - Displaying success/error notifications
 * - Refreshing data after deletion
 *
 * @example
 * ```tsx
 * export const BroadcastDeleteButton = ({ row, refetch }) => (
 *   <DeleteButton
 *     row={row}
 *     apiFunction={(r) => broadcastMessagesDestroy({ path: { uuid: r.uuid } })}
 *     confirmTitle={translate('Delete broadcast')}
 *     confirmMessage={(r) => translate(
 *       'Are you sure you would like to delete broadcast {broadcast}?',
 *       { broadcast: <strong>{r.subject}</strong> },
 *       formatJsxTemplate
 *     )}
 *     successMessage={translate('Broadcast has been deleted.')}
 *     errorMessage={translate('Unable to delete broadcast.')}
 *     refetch={refetch}
 *   />
 * );
 * ```
 */
export function DeleteButton<TRow>({
  row,
  apiFunction,
  confirmTitle = translate('Confirmation'),
  confirmMessage,
  successMessage = translate('Item has been deleted.'),
  errorMessage = translate('Unable to delete item.'),
  refetch,
  onSuccess,
  title = translate('Delete'),
  iconNode = <TrashIcon weight="bold" />,
  disabled,
  tooltip,
  buttonSize = 'sm',
  renderAs = 'action-item',
  skipConfirmation = false,
}: DeleteButtonProps<TRow>) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const resolveValue = <T extends ReactNode | string>(
    value: T | ((row: TRow) => T),
  ): T =>
    typeof value === 'function' ? (value as (row: TRow) => T)(row) : value;

  const handleDelete = useCallback(async () => {
    if (!skipConfirmation) {
      try {
        await waitForConfirmation(
          dispatch,
          resolveValue(confirmTitle),
          resolveValue(confirmMessage),
          { forDeletion: true },
        );
      } catch {
        return;
      }
    }

    setLoading(true);
    try {
      await apiFunction(row);
      dispatch(showSuccess(resolveValue(successMessage)));
      await refetch?.();
      onSuccess?.();
    } catch (e) {
      dispatch(showErrorResponse(e, resolveValue(errorMessage)));
    } finally {
      setLoading(false);
    }
  }, [
    dispatch,
    row,
    apiFunction,
    confirmTitle,
    confirmMessage,
    successMessage,
    errorMessage,
    refetch,
    onSuccess,
    skipConfirmation,
  ]);

  if (renderAs === 'button') {
    const ButtonComponent =
      buttonSize === 'sm' ? CompactActionButton : ActionButton;
    return (
      <ButtonComponent
        action={handleDelete}
        title={title}
        iconNode={iconNode}
        disabled={disabled || loading}
        tooltip={tooltip}
        variant="danger"
        pending={loading}
      />
    );
  }

  return (
    <ActionItem
      action={handleDelete}
      title={title}
      iconNode={iconNode}
      disabled={disabled || loading}
      tooltip={tooltip}
      size={buttonSize}
      className="text-danger"
      iconColor="danger"
    />
  );
}
