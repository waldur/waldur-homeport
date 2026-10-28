import { QuestionIcon } from '@phosphor-icons/react';
import React, { useMemo, useState } from 'react';
import { usersPartialUpdate } from 'waldur-js-client';
import { User } from 'waldur-js-client';

import { FormField, FormText, Tooltip } from 'waldur-ui';

import { ENV } from '@/core/config';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { SubmitButton } from '@/form';
import { FormGroup } from '@/form';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { SecretField } from '@/marketplace/common/SecretField';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { isImpersonating } from '@/user/termsGate';
import { useSetUser } from '@/workspace/hooks';

const TOKEN_OPTIONS = [
  { label: translate('{count} minutes', { count: 10 }), value: 600 },
  { label: translate('{count} minutes', { count: 30 }), value: 1800 },
  { label: translate('{count} hour', { count: 1 }), value: 3600 },
  { label: translate('{count} hours', { count: 2 }), value: 7200 },
  { label: translate('{count} hours', { count: 12 }), value: 43200 },
  { label: translate('token will not timeout'), value: null },
];

const formatLifetime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return minutes % 60
    ? translate('{count} minutes', { count: minutes })
    : translate('{count} hours', { count: minutes / 60 });
};

const getLifetimeOption = (lifetime: number | null) =>
  TOKEN_OPTIONS.find((option) => option.value === lifetime) ?? {
    label: formatLifetime(lifetime),
    value: lifetime,
  };

// The longest lifetime staff let non-staff users choose, in seconds. Staff,
// also when impersonating, are not held to it; zero or less is no limit.
const getMaxLifetime = (user: User) => {
  const minutes = ENV.plugins.WALDUR_CORE.API_TOKEN_MAX_LIFETIME_MINUTES;
  if (user.is_staff || isImpersonating() || !(minutes > 0)) {
    return null;
  }
  return minutes * 60;
};

// The stored lifetime stays listed even when it is not a preset or is above
// the limit: saving it unchanged is still accepted.
const getTokenOptions = (
  lifetime: number | null,
  maxLifetime: number | null,
) => {
  const options = maxLifetime
    ? TOKEN_OPTIONS.filter(
        (option) => option.value !== null && option.value <= maxLifetime,
      )
    : [...TOKEN_OPTIONS];
  for (const value of maxLifetime ? [maxLifetime, lifetime] : [lifetime]) {
    if (
      value !== undefined &&
      !options.some((option) => option.value === value)
    ) {
      options.push(getLifetimeOption(value));
    }
  }
  return options.sort((a, b) => (a.value ?? Infinity) - (b.value ?? Infinity));
};

interface UserEditTokenComponentProps {
  user: User;
}

export const UserTokenLifetime: React.FC<UserEditTokenComponentProps> = (
  props,
) => {
  const setUser = useSetUser();
  const maxLifetime = getMaxLifetime(props.user);
  const options = useMemo(
    () => getTokenOptions(props.user.token_lifetime, maxLifetime),
    [props.user.token_lifetime, maxLifetime],
  );
  const [tokenLifetime, setTokenLifetime] = useState(
    options.find((option) => option.value === props.user.token_lifetime),
  );

  const { mutate: handleSubmit, isPending: submitting } = useManagedMutation({
    mutationFn: () =>
      usersPartialUpdate({
        path: { uuid: props.user.uuid },
        body: {
          token_lifetime: tokenLifetime?.value,
        },
      }),
    // A lifetime above the limit is accepted only unchanged, so once the user
    // moves off it the options must stop offering it.
    onSuccess: ({ data }) => setUser(data),
    successMessage: translate('User has been updated'),
    errorMessage: translate('User could not be updated'),
    closeModal: false,
  });

  return (
    <div className="card card-bordered mb-5">
      <div className="card-header">
        <div className="card-toolbar flex flex-wrap gap-3 w-full">
          <div className="flex-1 min-w-0 order-0 sm:max-w-1/4">
            <div className="card-title">
              <span className="h3 me-1.5">{translate('API token')}</span>
            </div>
          </div>
          <div className="w-full sm:w-auto sm:flex-none order-1 sm:order-2 min-w-1/4 ms-auto">
            <div className="flex sm:justify-end max-sm:flex-wrap whitespace-nowrap gap-2.5">
              <SubmitButton
                variant="primary"
                className="me-1.5"
                submitting={submitting}
                onClick={() => {
                  handleSubmit();
                }}
                label={translate('Save changes')}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="card-body">
        <FormGroup label={translate('API token')}>
          <div className="flex items-center gap-1.5">
            <SecretField value={props.user.token} />
            <CopyToClipboardButton
              value={props.user.token}
              size={20}
              className="mb-0 mt-0"
              buttonClassName="text-quaternary"
              verbose={translate('API token')}
              label={translate('Copy API token')}
            />
          </div>
        </FormGroup>
        <FormGroup
          label={
            <Tooltip
              label={translate(
                'Lifetime will be updated and reset upon saving the form. Token lifetime is prolonged each time a successful API call with the token is done.',
              )}
            >
              <span>
                {translate('Token lifetime')}
                <QuestionIcon weight="bold" />
              </span>
            </Tooltip>
          }
        >
          <Select
            value={tokenLifetime}
            options={options}
            onChange={(value) => setTokenLifetime(value)}
          />
          {maxLifetime ? (
            <FormText>
              {translate(
                'The longest token lifetime you can choose is {duration}.',
                { duration: getLifetimeOption(maxLifetime).label },
              )}
            </FormText>
          ) : null}
        </FormGroup>
        {tokenLifetime?.value === null ? (
          <FormField>
            <FormText variant="danger" role="status">
              {translate(
                'By setting token lifetime to indefinite you are allowing anyone who has the token to impersonate your actions till the token has been changed.',
              )}
              {translate(
                'Please make sure you know what you are doing and set to 10 minutes if unsure.',
              )}
            </FormText>
          </FormField>
        ) : null}
      </div>
    </div>
  );
};
