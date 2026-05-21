import { Field } from 'react-final-form';

import { SETTINGS_FREEIPA_GROUP_NAME } from '@/auth/providers/constants';
import { SecretField, StringField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { SettingsDescription } from '@/SettingsDescription';

import { getKeyTitle } from '../settings/utils';

export const ProviderFreeIPAForm = () => (
  <>
    {(
      SettingsDescription.find((group) =>
        group.description.includes(SETTINGS_FREEIPA_GROUP_NAME),
      )?.items || []
    ).map((item) => (
      <FormGroup
        key={item.key}
        label={getKeyTitle(item.key)}
        help={item.description}
      >
        {item.type === 'boolean' ? (
          <Field name={item.key} component={AwesomeCheckboxField} />
        ) : item.type === 'secret_field' ? (
          <Field name={item.key} component={SecretField} />
        ) : (
          <Field name={item.key} component={StringField} />
        )}
      </FormGroup>
    ))}
  </>
);
