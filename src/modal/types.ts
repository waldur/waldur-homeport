import { ReactNode } from 'react';
import { ModalProps } from 'react-bootstrap';

export type DialogSizeType = 'sm' | 'md' | 'lg' | 'xl';
export type ConfirmationDialogType =
  'primary' | 'success' | 'warning' | 'danger';
export type ModalAction =
  'SHOW_MODAL' | 'SHOW_CONFIRM' | 'HIDE_MODAL' | 'HIDE_CONFIRM';

export interface AppModalProps extends Omit<ModalProps, 'size'> {
  size?: DialogSizeType;
  formId?: string;
}

export interface ConfirmationOptions {
  forDeletion?: boolean;
  type?: ConfirmationDialogType;
  positiveButton?: string;
  negativeButton?: string;
  size?: DialogSizeType;
  positiveButtonVariant?: string;
  onlyPositiveButton?: boolean;
  iconNode?: ReactNode;
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputRequired?: boolean;
  showRouterSelect?: boolean;
  tenantUuid?: string;
}
