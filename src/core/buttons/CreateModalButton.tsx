import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    });
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
    <BaseButton
      onClick={handleClick}
      label={title}
      iconNode={iconNode}
      variant={variant}
      disabled={disabled}
      tooltip={tooltip}
      size={buttonSize ?? 'lg'}
    />
  );
}
