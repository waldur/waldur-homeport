import {
  ArrowCounterClockwiseIcon,
  ShieldCheckIcon,
} from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';

import { generatePassword } from '@waldur/core/generatePassword';
import { composeValidators, email, required } from '@waldur/core/validators';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { SecretField } from '@waldur/form/SecretField';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import { UserFormData, UserFormDialogData } from '../UserFormDialog';

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
  const form = useForm<UserFormData>();
  const { values } = useFormState<UserFormData>();
  const { editMode, user } = (props.data || {}) as UserFormDialogData;

  const handleGeneratePassword = useCallback(() => {
    const password = generatePassword(16);
    form.change('password', password);
    form.change('remove_password', false);
  }, [form]);

  const handleRemovePassword = useCallback(() => {
    form.change('password', '');
    form.change('remove_password', true);
  }, [form]);

  const handleCancelRemove = useCallback(() => {
    form.change('remove_password', false);
  }, [form]);

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
      >
        <Field
          name="is_support"
          component={AwesomeCheckboxField as any}
          type="checkbox"
        />
      </FormGroup>

      <h6 className="fw-bold mb-4 mt-6">
        {translate('Password')}
        {editMode && (
          <span className="ms-2">
            {user?.has_usable_password ? (
              <span className="badge badge-light-success fs-8 fw-semibold">
                <ShieldCheckIcon weight="bold" className="me-1" />
                {translate('Set')}
              </span>
            ) : (
              <span className="badge badge-light-warning fs-8 fw-semibold">
                {translate('Not set')}
              </span>
            )}
          </span>
        )}
      </h6>

      {values.remove_password ? (
        <div className="alert alert-warning d-flex align-items-center justify-content-between py-3">
          <span>{translate('Password will be removed when you save.')}</span>
          <button
            type="button"
            className="btn btn-sm btn-light-warning"
            onClick={handleCancelRemove}
          >
            {translate('Cancel')}
          </button>
        </div>
      ) : (
        <>
          <FormGroup
            label={translate('Password')}
            description={translate(
              'Leave empty to keep the current password unchanged.',
            )}
          >
            <div className="d-flex gap-2">
              <div className="flex-grow-1">
                <Field name="password" component={SecretField as any} />
              </div>
              <button
                type="button"
                className="btn btn-light-success btn-sm"
                onClick={handleGeneratePassword}
                title={translate('Generate password')}
              >
                <ArrowCounterClockwiseIcon weight="bold" className="me-1" />
                {translate('Generate')}
              </button>
            </div>
          </FormGroup>
          {editMode && user?.has_usable_password && !values.password && (
            <FormGroup label="" spaceless>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={handleRemovePassword}
              >
                {translate('Remove password')}
              </button>
            </FormGroup>
          )}
        </>
      )}
    </WizardModal>
  );
};
