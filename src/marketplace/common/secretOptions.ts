import type {
  OptionDefaultConfigs,
  ResourceOptionSecretStatus,
} from 'waldur-js-client';

import { translate } from '@/i18n';

/** The default_configs of a secret option. */
export type SecretPolicy = Pick<
  OptionDefaultConfigs,
  | 'secret_source'
  | 'customer_can_reveal'
  | 'min_length'
  | 'max_length'
  | 'multiline'
>;

export const SECRET_DEFAULT_MIN_LENGTH = 1;
export const SECRET_DEFAULT_MAX_LENGTH = 4096;
export const SECRET_MAX_LENGTH_CAP = 65536;

/**
 * Whether `value` holds a control character (U+0000 to U+001F, U+007F) other
 * than the `allowed` ones. Mirrors the server, which allows a multi-line
 * secret line breaks (CR, LF) and tabs only.
 */
const hasControlCharacter = (value: string, allowed = '') =>
  [...value].some((character) => {
    const code = character.charCodeAt(0);
    return (code < 0x20 || code === 0x7f) && !allowed.includes(character);
  });

/** The policy with the server's defaults filled in (`SecretPolicy`). */
export const resolveSecretPolicy = (policy: SecretPolicy | undefined) => {
  const source = policy?.secret_source || 'customer';
  return {
    source,
    customerSets: source === 'customer',
    // Not shown back by default when the customer typed it; shown when the
    // provider set it, as the customer has no other way to read it.
    customerCanReveal: policy?.customer_can_reveal ?? source === 'provider',
    minLength: policy?.min_length || SECRET_DEFAULT_MIN_LENGTH,
    maxLength: Math.min(
      policy?.max_length || SECRET_DEFAULT_MAX_LENGTH,
      SECRET_MAX_LENGTH_CAP,
    ),
    multiline: Boolean(policy?.multiline),
  };
};

/** Python counts code points, not UTF-16 units. */
const countCharacters = (value: string) => [...value].length;

/**
 * Why the server would refuse a secret value, never echoing it; undefined
 * when it is fine. An empty value sets nothing and is left to `required`.
 */
export const validateSecretValue = (
  value: string | undefined,
  policy: SecretPolicy | undefined,
  { asProvider = false }: { asProvider?: boolean } = {},
): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const resolved = resolveSecretPolicy(policy);
  if (!resolved.customerSets && !asProvider) {
    return translate('The provider sets this secret; leave it out.');
  }
  const length = countCharacters(value);
  if (length < resolved.minLength || length > resolved.maxLength) {
    return translate('Enter {min} to {max} characters.', {
      min: resolved.minLength,
      max: resolved.maxLength,
    });
  }
  if (resolved.multiline) {
    return hasControlCharacter(value, '\n\r\t')
      ? translate('The secret may not hold control characters.')
      : undefined;
  }
  return hasControlCharacter(value)
    ? translate('The secret must be a single line, without control characters.')
    : undefined;
};

/** What the policy accepts, for the help text: "8 to 255 characters". */
export const describeSecretPolicy = (policy: SecretPolicy | undefined) => {
  const resolved = resolveSecretPolicy(policy);
  return resolved.multiline
    ? translate('{min} to {max} characters; several lines are allowed.', {
        min: resolved.minLength,
        max: resolved.maxLength,
      })
    : translate('{min} to {max} characters, on one line.', {
        min: resolved.minLength,
        max: resolved.maxLength,
      });
};

/** "Set" or "Not set": a secret is never shown, only whether it is there. */
export const formatSecretStatus = (
  status: Pick<ResourceOptionSecretStatus, 'is_set'> | undefined,
) => (status?.is_set ? translate('Set') : translate('Not set'));

type SecretPolicyErrors = Partial<Record<'min_length' | 'max_length', string>>;

/**
 * Problems with a secret policy as a provider saves it. Mirrors
 * `validate_secret_policy` and the policy serializer's minimums.
 */
export const validateSecretPolicy = (
  policy: SecretPolicy | undefined,
): SecretPolicyErrors | undefined => {
  const errors: SecretPolicyErrors = {};
  const isLength = (value: unknown) =>
    typeof value === 'number' && Number.isInteger(value) && value >= 1;
  for (const key of ['min_length', 'max_length'] as const) {
    if (policy?.[key] != null && !isLength(policy[key])) {
      errors[key] = translate('Enter a whole number, 1 or more.');
    }
  }
  if (Object.keys(errors).length) {
    return errors;
  }
  const low = policy?.min_length ?? SECRET_DEFAULT_MIN_LENGTH;
  const high = policy?.max_length ?? SECRET_DEFAULT_MAX_LENGTH;
  if (high > SECRET_MAX_LENGTH_CAP) {
    errors.max_length = translate('Enter at most {count}.', {
      count: SECRET_MAX_LENGTH_CAP,
    });
  } else if (low > high) {
    errors.max_length = translate(
      'The longest length must not be lower than the shortest.',
    );
  }
  return Object.keys(errors).length ? errors : undefined;
};
