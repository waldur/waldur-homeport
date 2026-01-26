import { Field } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

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
      component={InputField as any}
      name="label"
      type="text"
      validate={required}
    />
  </FormGroup>
);
