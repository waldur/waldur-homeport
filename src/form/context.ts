import { createContext } from 'react';

import { FormGroupProps } from '@waldur/marketplace/offerings/FormGroup';

type FormFieldsContext = Pick<
  FormGroupProps,
  'labelClassName' | 'valueClassName' | 'classNameWithoutLabel'
> & {
  readOnlyFields?: Array<string>;
};

export const FormFieldsContext = createContext<FormFieldsContext>({
  labelClassName: undefined,
  valueClassName: undefined,
  classNameWithoutLabel: undefined,
  readOnlyFields: [],
});
