import { ComponentType, ReactNode } from 'react';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { AppModalProps } from '@/modal/actions';
import { DialogSizeType } from '@/modal/types';

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
