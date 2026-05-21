import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';

import { FormGroup } from '../../FormGroup';

export const DisplayNameField = () => (
  <FormGroup
    label={translate('Display name')}
    required={true}
    help={translate('Label that is visible to users in Marketplace.')}
    helpEnd
    space={5}
  >
    <Field
      component={InputField}
      name="label"
      type="text"
      validate={required}
    />
  </FormGroup>
);
