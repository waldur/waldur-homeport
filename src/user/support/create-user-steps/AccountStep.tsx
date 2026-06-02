import {
  ArrowCounterClockwiseIcon,
  ShieldCheckIcon,
} from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';

import { Badge } from '@/core/Badge';
import { generatePassword } from '@/core/generatePassword';
import { composeValidators, email, required } from '@/core/validators';
import { StringGroup, BooleanGroup } from '@/form';
import { FormGroup } from '@/form';
import { SecretField } from '@/form/SecretField';
import { translate } from '@/i18n';
import { WizardModal, WizardStepProps } from '@/wizard';

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
      <StringGroup
        name="username"
        validate={composeValidators(required, usernameValidator, maxLength128)}
        placeholder={translate('e.g. john.doe')}
        label={translate('Username')}
        required
      />
      <StringGroup
        name="email"
        validate={composeValidators(required, email)}
        placeholder={translate('e.g. john@example.com')}
        label={translate('Email')}
        required
      />
      <h6 className="fw-bold mb-4 mt-6">{translate('Roles & Status')}</h6>
      <BooleanGroup
        name="is_active"
        type="checkbox"
        label={translate('Active')}
        description={translate(
          'Designates whether this user should be treated as active.',
        )}
      />
      <BooleanGroup
        name="is_staff"
        type="checkbox"
        label={translate('Staff')}
        description={translate(
          'Designates whether the user can access admin site.',
        )}
      />
      <BooleanGroup
        name="is_support"
        type="checkbox"
        label={translate('Support')}
        description={translate(
          'Designates whether the user is a global support user.',
        )}
      />
      <BooleanGroup
        name="can_use_personal_access_tokens"
        type="checkbox"
        label={translate('Personal access tokens')}
        description={translate(
          'Designates whether the user is allowed to create and use personal access tokens.',
        )}
      />
      <h6 className="fw-bold mb-4 mt-6">
        {translate('Password')}
        {editMode && (
          <span className="ms-2">
            {user?.has_usable_password ? (
              <Badge
                variant="success"
                size="sm"
                leftIcon={<ShieldCheckIcon weight="bold" />}
                light
              >
                {translate('Set')}
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" light>
                {translate('Not set')}
              </Badge>
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
                <Field
                  name="password"
                  component={SecretField}
                  placeholder={translate('Password')}
                />
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
