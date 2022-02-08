import { createContext } from 'react';

import { FormGroupProps } from '@waldur/marketplace/offerings/FormGroup';

interface FormLayoutContext {
  layout: 'vertical' | 'horizontal';
}

export const FormLayoutContext = createContext<FormLayoutContext>({
  layout: 'horizontal',
});

type FormFieldsContext = Pick<
  FormGroupProps,
  'labelClassName' | 'valueClassName' | 'classNameWithoutLabel'
>;

export const FormFieldsContext = createContext<FormFieldsContext>({
  labelClassName: undefined,
  valueClassName: undefined,
  classNameWithoutLabel: undefined,
});
