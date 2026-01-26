import { Field } from 'react-final-form';

import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { FormGroup } from '../../FormGroup';

export const StringOptionConfig = () => (
  <FormGroup label={translate('Default value')}>
    <Field name="default" type="text" component={InputField as any} />
  </FormGroup>
);
