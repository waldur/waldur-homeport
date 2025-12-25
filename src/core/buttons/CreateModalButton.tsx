import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

import { CreateModalButtonProps } from './types';

/**
 * A generic button factory for opening create dialogs.
 *
 * Reduces boilerplate by encapsulating the common pattern of:
 * - Creating a callback that opens a modal dialog
 * - Passing resolve props to the dialog
 * - Rendering an AddButton with the callback
 *
 * @example
 * ```tsx
 * const BroadcastCreateDialog = lazyComponent(() =>
 *   import('./BroadcastFormDialog').then((m) => ({ default: m.BroadcastFormDialog })),
 * );
 *
 * export const BroadcastCreateButton = ({ refetch }) => (
 *   <CreateModalButton
 *     dialog={BroadcastCreateDialog}
 *     resolve={{ refetch }}
 *     size="xl"
 *   />
 * );
 * ```
 */
export function CreateModalButton<TResolve extends Record<string, unknown>>({
  dialog,
  resolve,
  size = 'lg',
  dialogClassName = 'modal-dialog-centered',
  formId,
  title = translate('Add'),
  iconNode = <PlusCircleIcon weight="bold" />,
  disabled,
  tooltip,
  variant = 'primary',
  buttonSize,
  initialValues,
}: CreateModalButtonProps<TResolve>) {
  const { openDialog } = useModal();

  const handleClick = useCallback(() => {
    openDialog(dialog, {
      resolve,
      size,
      dialogClassName,
      formId,
      initialValues,
    } as any);
  }, [
    dialog,
    resolve,
    size,
    dialogClassName,
    formId,
    initialValues,
    openDialog,
  ]);

  return (
    <ActionButton
      action={handleClick}
      title={title}
      iconNode={iconNode}
      variant={variant}
      size={buttonSize}
      disabled={disabled}
      tooltip={tooltip}
    />
  );
}
