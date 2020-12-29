import { FC } from 'react';
import { Field } from 'redux-form';

import { FormField } from './FormField';

export const DescriptionField: FC = () => (
  <Field name="description" component={FormField} />
);
