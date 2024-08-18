import { Field } from 'redux-form';

import {
  FormGroup,
  NumberField,
  SecretField,
  StringField,
  TextField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { EmailField } from '@waldur/form/EmailField';
import { SettingsDescription } from '@waldur/SettingsDescription';

import { getKeyTitle } from '../settings/utils';

const FieldRow = ({ field, ...rest }) =>
  field.type === 'string' ? (
    <StringField {...rest} />
  ) : field.type === 'boolean' ? (
    <AwesomeCheckboxField
      label={getKeyTitle(field.key)}
      hideLabel
      className="mt-3"
      {...rest}
    />
  ) : field.type === 'email_field' ? (
    <EmailField {...rest} />
  ) : field.type === 'text_field' ? (
    <TextField {...rest} />
  ) : field.type === 'integer' ? (
    <NumberField {...rest} />
  ) : field.type === 'secret_field' ? (
    <SecretField {...rest} />
  ) : (
    <StringField {...rest} />
  );

export const SupportSettingsForm = ({ name }) => {
  const fields = SettingsDescription.find((group) =>
    group.description.toLowerCase().includes(name),
  ).items;
  return (
    <>
      {fields.map((field) => (
        <Field
          component={FormGroup}
          name={field.key}
          key={field.key}
          label={
            field.type !== 'boolean' &&
            (field.description.length < 75
              ? field.description
              : getKeyTitle(field.key))
          }
        >
          <FieldRow field={field} />
        </Field>
      ))}
    </>
  );
};
