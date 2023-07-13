import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { FieldError } from '@waldur/form';
import { InputField } from '@waldur/form/InputField';

import { configAttrField } from './utils';

export const AttributeCell = ({ attribute }) => {
  if (attribute.type === 'boolean') {
    return (
      <Field
        name="value"
        component={(prop) => (
          <AwesomeCheckbox label={attribute.title} {...prop.input} />
        )}
      />
    );
  }
  const attr = configAttrField(attribute);
  return (
    <>
      <Field name="value" component={InputField} {...attr} />
      <Field
        name="value"
        {...attr}
        component={(fieldProps) => <FieldError error={fieldProps.meta.error} />}
      />
    </>
  );
};
