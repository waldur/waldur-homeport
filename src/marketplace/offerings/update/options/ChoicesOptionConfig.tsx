import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';

import { FormGroup } from '../../FormGroup';

export const ChoicesOptionConfig = () => (
  <FormGroup
    label={translate('Choices as comma-separated list')}
    required={true}
  >
    <Field
      name="choices"
      type="text"
      component={InputField as any}
      validate={required}
    />
  </FormGroup>
);
