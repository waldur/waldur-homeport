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
  /**
   * Value submitted when the control is cleared. React Final Form parses an
   * emptied text input to `undefined`, and `JSON.stringify` then drops the key
   * from the PATCH body entirely — so without this the field silently keeps its
   * old value. Defaults to `''`; numeric controls use `null`.
   */
  emptyValue?: any;
  tooltip?: string;
  iconNode?: React.ReactNode;
}
