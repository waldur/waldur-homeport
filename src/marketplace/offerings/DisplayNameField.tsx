import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';

import { FormGroup } from './FormGroup';

interface DisplayNameFieldProps {
  name: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export const DisplayNameField: FunctionComponent<DisplayNameFieldProps> = (
  props,
) => {
  return (
    <FormGroup
      label={translate('Display name')}
      required={true}
      help={translate('Label that is visible to users in Marketplace.')}
      helpEnd
      space={5}
    >
      <Field
        component={InputField as any}
        name={props.name}
        type="text"
        validate={required}
        disabled={props.disabled}
        readOnly={props.readOnly}
      />
    </FormGroup>
  );
};
