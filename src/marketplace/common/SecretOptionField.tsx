import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';

import { BaseButton, FormText, SecretInput, Textarea } from 'waldur-ui';

import { FormField } from '@/form/types';
import { translate } from '@/i18n';

import {
  describeSecretPolicy,
  resolveSecretPolicy,
  SecretPolicy,
} from './secretOptions';

/**
 * A multi-line secret (a PEM key, a kubeconfig), masked like a password
 * while typed or read: drawn in the text-security disc font the app loads,
 * as a textarea cannot be of type password.
 */
export const SecretTextarea: FC<{
  value: string;
  invalid?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}> = ({ value, invalid, readOnly, onChange, onBlur, onFocus }) => {
  const [shown, setShown] = useState(false);
  return (
    <div>
      <Textarea
        value={value}
        rows={5}
        invalid={invalid}
        readOnly={readOnly}
        // Never sent to a spelling service nor remembered by the browser.
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className={shown ? 'font-mono' : '[font-family:text-security-disc]'}
        onChange={(event) => onChange?.(event.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      <BaseButton
        className="mt-1"
        size="sm"
        variant="text-secondary"
        iconNode={
          shown ? <EyeSlashIcon weight="bold" /> : <EyeIcon weight="bold" />
        }
        label={shown ? translate('Hide') : translate('Show')}
        aria-pressed={shown}
        onClick={() => setShown((current) => !current)}
      />
    </div>
  );
};

/**
 * A secret option: a value the customer types once, sent with the order or
 * the options and stored encrypted, never shown in either. A secret the
 * provider sets has nothing to type here.
 */
export const SecretOptionField: FC<
  FormField & {
    field: { default_configs?: SecretPolicy };
    /** The provider sets any secret, whoever the policy says types it. */
    alwaysInput?: boolean;
  }
> = ({ field, input, meta, alwaysInput }) => {
  const policy = resolveSecretPolicy(field.default_configs);
  if (!policy.customerSets && !alwaysInput) {
    return (
      <FormText variant="muted" className="block">
        {translate('Set by the provider after provisioning.')}
      </FormText>
    );
  }
  const invalid = Boolean(meta?.touched && (meta.error || meta.submitError));
  // An emptied field leaves the value unset: an empty string sets nothing.
  const onChange = (value: string) => input.onChange(value || undefined);
  const value = typeof input.value === 'string' ? input.value : '';
  return (
    <div data-testid="secret-option-field">
      {policy.multiline ? (
        <SecretTextarea
          value={value}
          invalid={invalid}
          onChange={onChange}
          onBlur={() => input.onBlur()}
          onFocus={() => input.onFocus()}
        />
      ) : (
        <SecretInput
          value={value}
          invalid={invalid}
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => input.onBlur()}
          onFocus={() => input.onFocus()}
        />
      )}
      {/* The error below says the same about the length; one is enough. */}
      {!invalid && (
        <FormText variant="muted">
          {describeSecretPolicy(field.default_configs)}{' '}
          {translate(
            'It is stored encrypted and never shown with the other settings.',
          )}
        </FormText>
      )}
    </div>
  );
};
