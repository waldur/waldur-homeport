import { DialogSizeType } from '@waldur/modal/actions';
import { ActionValidator } from '@waldur/resource/actions/types';

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
}

export interface DialogActionProps<T>
  extends DialogLaunchProps<T>,
    ActionButtonProps {
  resource: T;
  validators?: ActionValidator<T>[];
  extraResolve?: any;
  iconClass?: string;
}
