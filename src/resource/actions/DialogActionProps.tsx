import { ReactNode } from 'react';
import { ButtonVariant, Variant } from 'react-bootstrap/esm/types';

import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { DialogSizeType } from '@/modal/types';
import { ActionValidator } from '@/resource/actions/types';

type ModalComponentProps<T> = React.ComponentType<{
  resolve: any & { resource: T };
  formId?: string;
}>;

interface DialogLaunchProps<T> {
  modalComponent: ModalComponentProps<T>;
  dialogSize?: DialogSizeType;
  formId?: string;
}

interface ActionButtonProps {
  title: string;
  icon?: string;
  className?: string;
  staff?: boolean;
  important?: boolean;
  variant?: ButtonVariant;
  actionItem?: boolean;
  size?: 'lg' | 'sm';
}

export interface DialogActionProps<T>
  extends DialogLaunchProps<T>, ActionButtonProps {
  resource: T;
  validators?: ActionValidator<T>[];
  extraResolve?: any;
  iconClass?: string;
  iconNode?: ReactNode;
  iconColor?: Variant;
  actionId?: ResourceAction;
}
