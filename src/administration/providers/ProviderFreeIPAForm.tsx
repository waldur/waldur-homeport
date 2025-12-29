import { Field } from 'react-final-form';

import { SETTINGS_FREEIPA_GROUP_NAME } from '@waldur/auth/providers/constants';
import { SecretField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { SettingsDescription } from '@waldur/SettingsDescription';

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
          <Field name={item.key} component={AwesomeCheckboxField as any} />
        ) : item.type === 'secret_field' ? (
          <Field name={item.key} component={SecretField as any} />
        ) : (
          <Field name={item.key} component={StringField as any} />
        )}
      </FormGroup>
    ))}
  </>
);
