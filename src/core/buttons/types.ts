import { ComponentType, ReactNode } from 'react';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { AppModalProps } from '@waldur/modal/actions';
import { DialogSizeType } from '@waldur/modal/types';

export interface CreateModalButtonProps<
  TResolve extends Record<string, unknown>,
> {
  /** The dialog component to open */
  dialog: ComponentType<{ resolve: TResolve } & AppModalProps>;
  /** Props passed to the dialog via resolve */
  resolve: TResolve;
  /** Modal size */
  size?: DialogSizeType;
  /** Additional dialog class name */
  dialogClassName?: string;
  /** Form ID for dirty form detection */
  formId?: string;
  /** Button title (defaults to 'Add') */
  title?: string;
  /** Custom icon (defaults to PlusCircleIcon) */
  iconNode?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Tooltip shown on hover */
  tooltip?: string;
  /** Button variant (defaults to 'primary') */
  variant?: ButtonVariant;
  /** Button size */
  buttonSize?: 'sm' | 'lg';
  /** Initial form values */
  initialValues?: Record<string, unknown>;
}

export interface EditModalButtonProps<
  TRow,
  TResolve extends Record<string, unknown>,
> {
  /** The dialog component to open */
  dialog: ComponentType<{ resolve: TResolve } & AppModalProps>;
  /** The row data being edited */
  row: TRow;
  /** Function to build resolve props from row */
  buildResolve?: (row: TRow) => TResolve;
  /** Direct resolve props (used if buildResolve not provided) */
  resolve?: TResolve;
  /** Function to transform row to form initial values */

  getInitialValues?: (row: TRow) => Record<string, any>;
  /** Modal size */
  size?: DialogSizeType;
  /** Additional dialog class name */
  dialogClassName?: string;
  /** Form ID for dirty form detection */
  formId?: string;
  /** Button title (defaults to 'Edit') */
  title?: string;
  /** Custom icon (defaults to PencilSimpleIcon) */
  iconNode?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Tooltip shown on hover */
  tooltip?: string;
  /** Button size */
  buttonSize?: 'sm' | 'lg';
  /** Render mode: 'action-item' for dropdown menu, 'button' for standalone */
  renderAs?: 'action-item' | 'button';
}

export interface DeleteButtonProps<TRow> {
  /** The row data being deleted */
  row: TRow;
  /** API function to call for deletion */
  apiFunction: (row: TRow) => Promise<unknown>;
  /** Confirmation dialog title */
  confirmTitle?: ReactNode | ((row: TRow) => ReactNode);
  /** Confirmation dialog message (required) */
  confirmMessage: ReactNode | ((row: TRow) => ReactNode);
  /** Success notification message */
  successMessage?: string | ((row: TRow) => string);
  /** Error notification message */
  errorMessage?: string | ((row: TRow) => string);
  /** Callback after successful deletion */
  refetch?: () => void | Promise<void>;
  /** Additional success callback */
  onSuccess?: () => void;
  /** Button title (defaults to 'Delete') */
  title?: string;
  /** Custom icon (defaults to TrashIcon) */
  iconNode?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Tooltip shown on hover */
  tooltip?: string;
  /** Button size */
  buttonSize?: 'sm' | 'lg';
  /** Render mode: 'action-item' for dropdown menu, 'button' for standalone */
  renderAs?: 'action-item' | 'button';
  /** Skip confirmation dialog */
  skipConfirmation?: boolean;
}
