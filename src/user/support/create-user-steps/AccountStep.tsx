import { FC } from 'react';
import { Field } from 'react-final-form';

import { composeValidators, email, required } from '@waldur/core/validators';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

const usernameValidator = (value: string) =>
  value && !/^[a-z0-9@.+\-_]+$/.test(value)
    ? translate(
        'Only lowercase letters, numbers, and @/./+/-/_ characters are allowed.',
      )
    : undefined;

const maxLength128 = (value: string) =>
  value && value.length > 128
    ? translate('Must be 128 characters or fewer.')
    : undefined;

export const AccountStep: FC<WizardStepProps> = (props) => {
  return (
    <WizardModal {...props}>
      <FormGroup label={translate('Username')} required>
        <Field
          name="username"
          component={StringField as any}
          validate={composeValidators(
            required,
            usernameValidator,
            maxLength128,
          )}
          placeholder={translate('e.g. john.doe')}
        />
      </FormGroup>
      <FormGroup label={translate('Email')} required>
        <Field
          name="email"
          component={StringField as any}
          validate={composeValidators(required, email)}
          placeholder={translate('e.g. john@example.com')}
        />
      </FormGroup>

      <h6 className="fw-bold mb-4 mt-6">{translate('Roles & Status')}</h6>
      <FormGroup
        label={translate('Active')}
        description={translate(
          'Designates whether this user should be treated as active.',
        )}
      >
        <Field
          name="is_active"
          component={AwesomeCheckboxField as any}
          type="checkbox"
        />
      </FormGroup>
      <FormGroup
        label={translate('Staff')}
        description={translate(
          'Designates whether the user can access admin site.',
        )}
      >
        <Field
          name="is_staff"
          component={AwesomeCheckboxField as any}
          type="checkbox"
        />
      </FormGroup>
      <FormGroup
        label={translate('Support')}
        description={translate(
          'Designates whether the user is a global support user.',
        )}
        spaceless
      >
        <Field
          name="is_support"
          component={AwesomeCheckboxField as any}
          type="checkbox"
        />
      </FormGroup>
    </WizardModal>
  );
};
