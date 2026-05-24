import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionButton } from '@/table/ActionButton';
import { CompactActionButton } from '@/table/CompactActionButton';

import { EditModalButtonProps } from './types';

/**
 * A generic button factory for opening edit dialogs.
 *
 * Reduces boilerplate by encapsulating the common pattern of:
 * - Creating a callback that opens a modal dialog with row data
 * - Passing resolve props and initialValues to the dialog
 * - Rendering an EditAction or ActionButton with the callback
 *
 * @example
 * ```tsx
 * const BroadcastUpdateDialog = lazyComponent(() =>
 *   import('./BroadcastFormDialog').then((m) => ({ default: m.BroadcastFormDialog })),
 * );
 *
 * export const BroadcastUpdateButton = ({ row, refetch }) => (
 *   <EditModalButton
 *     dialog={BroadcastUpdateDialog}
 *     row={row}
 *     buildResolve={(r) => ({ uuid: r.uuid, refetch })}
 *     getInitialValues={parseBroadcast}
 *     size="xl"
 *     title={translate('Update')}
 *   />
 * );
 * ```
 */
export function EditModalButton<
  TRow,
  TResolve extends Record<string, unknown>,
>({
  dialog,
  row,
  buildResolve,
  resolve,
  getInitialValues,
  size = 'lg',
  dialogClassName = 'modal-dialog-centered',
  formId,
  title = translate('Edit'),
  iconNode = <PencilSimpleIcon weight="bold" />,
  disabled,
  tooltip,
  buttonSize = 'sm',
  renderAs = 'action-item',
}: EditModalButtonProps<TRow, TResolve>) {
  const finalResolve = buildResolve ? buildResolve(row) : resolve;
  const initialValues = getInitialValues ? getInitialValues(row) : undefined;
  const { openDialog } = useModal();

  const handleClick = useCallback(() => {
    openDialog(dialog, {
      resolve: finalResolve,
      initialValues,
      size,
      dialogClassName,
      formId,
    });
  }, [
    dialog,
    finalResolve,
    initialValues,
    size,
    dialogClassName,
    formId,
    openDialog,
  ]);

  if (renderAs === 'button') {
    const ButtonComponent =
      buttonSize === 'sm' ? CompactActionButton : ActionButton;
    return (
      <ButtonComponent
        action={handleClick}
        title={title}
        iconNode={iconNode}
        variant="tertiary"
        disabled={disabled}
        tooltip={tooltip}
      />
    );
  }

  return (
    <ActionItem
      action={handleClick}
      title={title}
      iconNode={iconNode}
      disabled={disabled}
      tooltip={tooltip}
      size={buttonSize}
    />
  );
}
