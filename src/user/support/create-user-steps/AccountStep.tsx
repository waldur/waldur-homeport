import {
  ArrowCounterClockwiseIcon,
  ShieldCheckIcon,
} from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';

import { AlertItem, Badge, BaseButton } from 'waldur-ui';

import { generatePassword } from '@/core/generatePassword';
import { composeValidators, email, required } from '@/core/validators';
import { StringGroup, BooleanGroup, TextGroup } from '@/form';
import { FormGroup } from '@/form';
import { SecretField } from '@/form/SecretField';
import { translate } from '@/i18n';
import { WizardModal, WizardStepProps } from '@/wizard';

import { getProtectedFieldProps } from '../getProtectedFieldProps';
import { UserFormData, UserFormDialogData } from '../UserFormTypes';

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

const validateUsername = composeValidators(
  required,
  usernameValidator,
  maxLength128,
);

export const AccountStep: FC<WizardStepProps> = (props) => {
  const form = useForm<UserFormData>();
  const { values } = useFormState<UserFormData>();
  const { editMode, user } = (props.data || {}) as UserFormDialogData;
  const emailProps =
    editMode && user
      ? getProtectedFieldProps(user, 'email', false, user.email)
      : undefined;

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
        // Read-only when editing, here and in the API. Accounts created
        // outside this form (e.g. `waldur createstaffuser`) can hold names
        // the create rules reject, which would block every edit unseen.
        validate={editMode ? undefined : validateUsername}
        placeholder={translate('e.g. john.doe')}
        label={translate('Username')}
        required
        disabled={editMode}
        description={
          editMode
            ? translate(
                'The username cannot be changed after the account is created.',
              )
            : undefined
        }
      />
      <StringGroup
        name="email"
        // The identity provider owns the email, so the API refuses a change.
        // Don't validate what can't be edited: an empty one would block Next.
        validate={
          emailProps?.isProtected
            ? undefined
            : composeValidators(required, email)
        }
        placeholder={translate('e.g. john@example.com')}
        label={translate('Email')}
        required
        disabled={emailProps?.isProtected}
        description={emailProps?.tooltip}
      />
      <h6 className="font-medium mb-4 mt-6">{translate('Roles & Status')}</h6>
      <BooleanGroup
        name="is_active"
        type="checkbox"
        label={translate('Active')}
        description={translate(
          'Designates whether this user should be treated as active.',
        )}
      />
      {editMode && user?.is_active && !values.is_active && (
        <TextGroup
          name="deactivation_reason"
          label={translate('Deactivation reason')}
          rows={3}
          validate={required}
          required
          description={translate(
            'Required. This is an administrative override: the account will not be reactivated automatically by the system, even if the user regains roles.',
          )}
        />
      )}
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
      <h6 className="font-medium mb-4 mt-6">
        {translate('Password')}
        {editMode && (
          <span className="ms-2">
            {user?.has_usable_password ? (
              <Badge
                variant="success"
                size="sm"
                leftIcon={<ShieldCheckIcon weight="bold" />}
                tone="outline"
              >
                {translate('Set')}
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" tone="outline">
                {translate('Not set')}
              </Badge>
            )}
          </span>
        )}
      </h6>
      {values.remove_password ? (
        <AlertItem
          type="floating"
          variant="warning"
          title={translate('Password will be removed when you save.')}
          actions={
            <BaseButton
              variant="warning"
              size="sm"
              onClick={handleCancelRemove}
              label={translate('Cancel')}
            />
          }
        />
      ) : (
        <>
          <FormGroup
            label={translate('Password')}
            description={translate(
              'Leave empty to keep the current password unchanged.',
            )}
          >
            <div className="flex gap-2">
              <div className="grow">
                <Field name="password">
                  {({ input, meta }) => (
                    <SecretField
                      input={input}
                      meta={meta}
                      placeholder={translate('Password')}
                    />
                  )}
                </Field>
              </div>
              <BaseButton
                variant="success"
                size="sm"
                onClick={handleGeneratePassword}
                tooltip={translate('Generate password')}
                iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
                label={translate('Generate')}
              />
            </div>
          </FormGroup>
          {editMode && user?.has_usable_password && !values.password && (
            <FormGroup label="" spaceless>
              <BaseButton
                variant="danger"
                size="sm"
                onClick={handleRemovePassword}
                label={translate('Remove password')}
              />
            </FormGroup>
          )}
        </>
      )}
    </WizardModal>
  );
};
