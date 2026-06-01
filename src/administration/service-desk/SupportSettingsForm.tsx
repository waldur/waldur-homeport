import {
  BooleanGroup,
  EmailGroup,
  NumberGroup,
  SecretGroup,
  StringGroup,
  TextGroup,
} from '@/form';
import { SettingsDescription } from '@/SettingsDescription';

import { getKeyTitle } from '../settings/utils';

const getFieldComponent = (fieldType: string) => {
  switch (fieldType) {
    case 'string':
      return StringGroup;
    case 'boolean':
      return BooleanGroup;
    case 'email_field':
      return EmailGroup;
    case 'text_field':
      return TextGroup;
    case 'integer':
      return NumberGroup;
    case 'secret_field':
      return SecretGroup;
    case 'dict_field':
      return TextGroup;
    default:
      return StringGroup;
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
  const fields =
    SettingsDescription.find((group) =>
      group.description.toLowerCase().includes(name),
    )?.items || [];

  return (
    <>
      {fields.map((field) => {
        const FieldComponent = getFieldComponent(field.type);
        const isBoolean = field.type === 'boolean';
        const isDictField = field.type === 'dict_field';

        return (
          <FieldComponent
            key={field.key}
            name={field.key}
            label={
              isBoolean
                ? getKeyTitle(field.key)
                : field.description.length < 75
                  ? field.description
                  : getKeyTitle(field.key)
            }
            format={isDictField ? formatDictField : undefined}
            parse={isDictField ? parseDictField : undefined}
            {...(isBoolean ? { className: 'mt-3' } : {})}
            {...(isDictField ? { rows: 5 } : {})}
          />
        );
      })}
    </>
  );
};
