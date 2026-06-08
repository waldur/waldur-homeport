import { FC } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { FormTableItemProps } from '@/form/FormTable';

export interface FieldEditButtonProps extends Partial<
  Omit<FormTableItemProps, 'actions'>
> {
  title?: string;
  scope: any;
  name: string;
  callback(formData): Promise<any>;
  fieldComponent: FC<FieldRenderProps<any>>;
  hideLabel?: boolean;
  fieldProps?: Record<string, any>;
  tooltip?: string;
  iconNode?: React.ReactNode;
}
