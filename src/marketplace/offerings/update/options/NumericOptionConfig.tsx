import { Field } from 'react-final-form';

import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { FormGroup } from '../../FormGroup';

export const NumericOptionConfig = () => (
  <>
    <FormGroup label={translate('Minimal value')}>
      <Field name="min" type="number" component={InputField as any} />
    </FormGroup>
    <FormGroup label={translate('Maximal value')}>
      <Field name="max" type="number" component={InputField as any} />
    </FormGroup>
  </>
);
