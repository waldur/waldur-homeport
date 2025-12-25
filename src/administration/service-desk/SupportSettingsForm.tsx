import { Field } from 'react-final-form';

import { NumberField, SecretField, StringField, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { EmailField } from '@waldur/form/EmailField';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { SettingsDescription } from '@waldur/SettingsDescription';

import { getKeyTitle } from '../settings/utils';

const getFieldComponent = (fieldType: string) => {
  switch (fieldType) {
    case 'string':
      return StringField;
    case 'boolean':
      return AwesomeCheckboxField;
    case 'email_field':
      return EmailField;
    case 'text_field':
      return TextField;
    case 'integer':
      return NumberField;
    case 'secret_field':
      return SecretField;
    case 'dict_field':
      return TextField;
    default:
      return StringField;
  }
};

const formatDictField = (value) => {
  if (!value) return '';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '';
    }
  }
  return value;
};

const parseDictField = (value) => {
  if (!value || !value.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const SupportSettingsForm = ({ name }) => {
  const fields = SettingsDescription.find((group) =>
    group.description.toLowerCase().includes(name),
  ).items;

  return (
    <>
      {fields.map((field) => {
        const FieldComponent = getFieldComponent(field.type);
        const isBoolean = field.type === 'boolean';
        const isDictField = field.type === 'dict_field';

        return (
          <FormGroup
            key={field.key}
            label={
              !isBoolean &&
              (field.description.length < 75
                ? field.description
                : getKeyTitle(field.key))
            }
          >
            <Field
              name={field.key}
              component={FieldComponent as any}
              format={isDictField ? formatDictField : undefined}
              parse={isDictField ? parseDictField : undefined}
              {...(isBoolean
                ? {
                    label: getKeyTitle(field.key),
                    hideLabel: true,
                    className: 'mt-3',
                  }
                : {})}
              {...(isDictField ? { rows: 5 } : {})}
            />
          </FormGroup>
        );
      })}
    </>
  );
};
