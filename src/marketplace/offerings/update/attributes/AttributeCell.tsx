import { FC } from 'react';
import { Field } from 'react-final-form';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { FormGroup } from '@/form';
import { InputField } from '@/form/InputField';

import { configAttrField } from './utils';

export const AttributeCell: FC<{ attribute }> = ({ attribute }) => {
  if (attribute.type === 'boolean') {
    return (
      <Field
        name="value"
        render={(prop) => (
          <AwesomeCheckbox
            {...prop.input}
            type="switch"
            label={attribute.title}
          />
        )}
      />
    );
  }
  const attr = configAttrField(attribute);
  const Component = attr.component || InputField;
  return (
    <Field
      name="value"
      {...attr}
      component={FormGroup as any}
      hideLabel={true}
      spaceless={true}
    >
      <Component />
    </Field>
  );
};
