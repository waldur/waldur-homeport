import { FC } from 'react';

import { FormText, Input } from 'waldur-ui';

import { FieldError } from '@/form';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';

import { CidrListEditor } from './CidrListEditor';
import {
  CidrOptionPolicy,
  describeCidrPolicy,
  getCidrPlaceholder,
} from './cidrOptions';
import { flattenErrors } from './ipsecVpn';

const toList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
    : typeof value === 'string' && value
      ? [value]
      : [];

/**
 * A cidr option: one network in CIDR form, or a list of them when the
 * policy has `multiple`. The help text says what the policy accepts; the
 * form's validator (validateCidrValue) holds back a refused value, and the
 * server's errors (per entry, keyed by position) are shown until edited.
 */
export const CidrOptionField: FC<
  FormField & {
    field: {
      label?: string;
      required?: boolean;
      default_configs?: CidrOptionPolicy;
    };
  }
> = ({ field, input, meta }) => {
  const policy = field.default_configs || {};
  const description = describeCidrPolicy(policy);
  const attempted = Boolean(meta?.submitFailed);
  const serverErrors =
    meta?.submitError && !meta.dirtySinceLastSubmit
      ? flattenErrors(meta.submitError)
      : [];
  if (policy.multiple) {
    return (
      <div data-testid="cidr-option-field">
        <CidrListEditor
          values={toList(input.value)}
          onChange={input.onChange}
          policy={policy}
          showEmptyErrors={attempted}
          startWithRow
          keepOneRow={field.required}
          emptyMessage={translate('Add the networks in CIDR form.')}
        />
        {description && <FormText variant="muted">{description}</FormText>}
        {attempted && typeof meta?.error === 'string' && (
          <FieldError error={meta.error} />
        )}
        {serverErrors.length > 0 && <FieldError error={serverErrors} />}
      </div>
    );
  }
  const showError = Boolean(meta?.error) && (meta?.touched || attempted);
  return (
    <div data-testid="cidr-option-field">
      <Input
        value={typeof input.value === 'string' ? input.value : ''}
        placeholder={getCidrPlaceholder(policy)}
        invalid={showError || serverErrors.length > 0}
        // An emptied field leaves the value unset: the server refuses an
        // empty string as a network.
        onChange={(event) =>
          input.onChange(event.target.value.trim() || undefined)
        }
        onBlur={() => input.onBlur()}
        onFocus={() => input.onFocus()}
      />
      {description && <FormText variant="muted">{description}</FormText>}
      {showError && <FieldError error={meta.error} />}
      {serverErrors.length > 0 && <FieldError error={serverErrors} />}
    </div>
  );
};
