import { CSSProperties, ReactNode } from 'react';

import type { ButtonVariant } from '../Button';

import type { ModalSize } from './Modal';

export type DialogSizeType = ModalSize;
export type ConfirmationDialogType =
  'primary' | 'success' | 'warning' | 'danger';
export type ModalAction =
  'SHOW_MODAL' | 'SHOW_CONFIRM' | 'HIDE_MODAL' | 'HIDE_CONFIRM';

/** What ModalRoot reads from openDialog's props; the rest go to the dialog. */
export interface AppModalProps {
  /** The dialog's own input, by convention. */
  resolve?: any;
  /** A form dialog's initial values, by convention. */
  initialValues?: any;
  size?: DialogSizeType;
  formId?: string;
  /** The dialog's accessible name, when it is not its visible title. */
  title?: ReactNode;
  centered?: boolean;
  scrollable?: boolean;
  /** The scrolling overlay. */
  className?: string;
  /** The dialog's outer box, which sizes and places it. */
  dialogClassName?: string;
  backdropClassName?: string;
  modalStyle?: CSSProperties;
  keyboard?: boolean;
  backdrop?: boolean | 'static';
  animation?: boolean;
}

/**
 * An extra control in a confirmation's body, whose value comes back in the
 * confirm's result as `result[resultKey]` (through `toResult`) when set.
 * The app's OpenStack router picker is one (routerConfirmField).
 */
export interface ConfirmationExtraField<T = any> {
  render: (value: T | null, onChange: (value: T | null) => void) => ReactNode;
  resultKey: string;
  toResult?: (value: T) => unknown;
}

export interface ConfirmationOptions {
  forDeletion?: boolean;
  type?: ConfirmationDialogType;
  positiveButton?: string;
  negativeButton?: string;
  size?: DialogSizeType;
  positiveButtonVariant?: ButtonVariant;
  onlyPositiveButton?: boolean;
  iconNode?: ReactNode;
  hideIcon?: boolean;
  bodyClassName?: string;
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputRequired?: boolean;
  extraField?: ConfirmationExtraField;
}
