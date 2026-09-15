import {
  BooleanGroup,
  EmailGroup,
  NumberGroup,
  SecretGroup,
  StringGroup,
  TextGroup,
} from '@/form';
import { translate } from '@/i18n';

import { getKeyTitle } from '../settings/utils';

// Stored as secrets, but not secret to the person configuring them.
const FIELD_TYPE_OVERRIDES: Record<string, string> = {
  ATLASSIAN_OAUTH2_CLIENT_ID: 'string',
};

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

// Labels worded as in the identity provider form, and for settings whose
// description is too long to serve as one.
const getLabelOverrides = (): Record<
  string,
  { label: string; help: string }
> => ({
  ATLASSIAN_OAUTH2_CLIENT_ID: {
    label: translate('Client ID'),
    help: translate('ID of application used for OAuth authentication.'),
  },
  ATLASSIAN_OAUTH2_CLIENT_SECRET: {
    label: translate('Client secret'),
    help: translate('Application secret key.'),
  },
});

export const SettingField = ({ field }) => {
  const type = FIELD_TYPE_OVERRIDES[field.key] || field.type;
  const FieldComponent = getFieldComponent(type);
  const isBoolean = type === 'boolean';
  const isDictField = type === 'dict_field';
  const isLongDescription = field.description.length >= 75;
  const override = getLabelOverrides()[field.key];

  return (
    <FieldComponent
      name={field.key}
      label={
        override?.label ||
        (isBoolean || isLongDescription
          ? getKeyTitle(field.key)
          : field.description)
      }
      help={override?.help}
      description={
        isLongDescription && !override ? field.description : undefined
      }
      format={isDictField ? formatDictField : undefined}
      parse={isDictField ? parseDictField : undefined}
      {...(isBoolean ? { className: 'mt-3' } : {})}
      {...(isDictField ? { rows: 5 } : {})}
    />
  );
};
