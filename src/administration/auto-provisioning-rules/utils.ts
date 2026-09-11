import { translate } from '@/i18n';

/**
 * Normalise a value coming from `CommaSeparatedListGroup` into an array.
 *
 * The control emits an array as soon as the user types into it, while a field
 * left untouched still holds the string the dialog seeded it with, so both
 * shapes reach the submit handler. Treating one as the other throws and the
 * form silently refuses to submit.
 */
export const toList = (
  value: string | string[] | undefined | null,
  separator: ',' | ' ' = ',',
): string[] => {
  if (!value) return [];
  const items = Array.isArray(value) ? value : value.split(separator);
  return items.map((item) => item.trim()).filter(Boolean);
};

/** One editable row of the `user_claims` map. */
export interface ClaimRow {
  claim: string;
  // Same dual shape as the other list controls: seeded as an array, but the
  // control emits an array as soon as the user types.
  values: string | string[];
}

export const claimsToRows = (
  claims: Record<string, string[]> | undefined | null,
): ClaimRow[] =>
  Object.entries(claims ?? {}).map(([claim, values]) => ({
    claim,
    values: values ?? [],
  }));

export const rowsToClaims = (
  rows: ClaimRow[] | undefined | null,
): Record<string, string[]> =>
  (rows ?? []).reduce<Record<string, string[]>>((acc, row) => {
    const claim = row?.claim?.trim();
    const values = toList(row?.values);
    // A half-filled row is dropped rather than submitted: the backend rejects
    // an empty claim name or an empty value list, and the user is most likely
    // mid-edit on a row they added and abandoned.
    if (claim && values.length) {
      acc[claim] = values;
    }
    return acc;
  }, {});

export const validateUserClaims = (rows: ClaimRow[] | undefined) => {
  const seen = new Set<string>();
  for (const row of rows ?? []) {
    const claim = row?.claim?.trim();
    const values = toList(row?.values);
    if (!claim && values.length) {
      return translate('Enter a claim name.');
    }
    // The API shape is a map, so two rows naming the same claim would silently
    // collapse into one on submit and the earlier row's values would be lost.
    if (claim) {
      if (seen.has(claim)) {
        return translate(
          'Claim "{claim}" is listed twice. Put all of its accepted values in one row.',
          { claim },
        );
      }
      seen.add(claim);
    }
    if (claim && !values.length) {
      return translate('Enter at least one accepted value for "{claim}".', {
        claim,
      });
    }
    if (values.some((value) => value === '*')) {
      return translate(
        'A bare "*" would match every value the claim carries. Use a prefix such as "group-*".',
      );
    }
  }
  return undefined;
};

export const validateEmailPatterns = (value) => {
  const patterns = toList(value, ' ');

  const emailLikeRegex = /@.+\..+/;

  for (const pattern of patterns) {
    if (!emailLikeRegex.test(pattern)) {
      return translate('Please use valid email patterns.');
    }
    try {
      new RegExp(pattern);
    } catch {
      return translate('Pattern is not a valid regex.');
    }
  }
  return undefined;
};

/** Organization is required unless it is resolved from the user's claim.
 *
 * Field-level rather than record-level: the wizard gates "Next" on whole-form
 * validity, and a record-level error for a step-2 field would make step 1
 * impossible to leave. A field that is not mounted is not registered, so its
 * validator does not run until the step is reached.
 */
export const validateRuleOrganization = (value, allValues) =>
  allValues?.use_user_organization_as_customer_name || value
    ? undefined
    : translate('This field is required.');

/** A rule has to grant something, and one that creates no project has only the
 * organization role left. Mirrors the serializer. */
export const validateRuleGrant = (value, allValues) => {
  if (!value && !allValues?.project_role) {
    return translate('Choose an organization role, a project role, or both.');
  }
  if (allValues?.create_project === false && !value) {
    return translate(
      'A rule that does not create a project must grant an organization role.',
    );
  }
  return undefined;
};
