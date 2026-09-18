import { FC, ReactNode, useMemo } from 'react';

import { useEditFieldContext } from '@/form/EditFieldContext';
import { MultiCountrySelectEditField, withEditField } from '@/form/editFields';
import { translate } from '@/i18n';
import {
  formatAssuranceUri,
  formatOrganizationType,
  getAffiliationOptions,
  getAssuranceLevelOptions,
  getOrganizationTypeOptions,
} from '@/user/support/aai-constants';
import {
  isProfileAttributeEnabled,
  ProfileAttribute,
} from '@/user/support/profileAttributes';

import { RestrictionsValue } from './RestrictionsValue';
import { RestrictionTagsField } from './RestrictionTagsField';
import { getRestrictionsArray } from './types';

const RestrictionTagsEditField = withEditField(RestrictionTagsField);

interface EligibilityRestrictionFormItemsProps {
  /** Locks every row. `withEditField` disables a row only when the field itself
   * says so -- the provider's `readOnlyReason` only supplies the tooltip. */
  disabled?: boolean;
}

interface RowGate {
  visible: boolean;
  warnTooltip?: string;
}

/** The six eligibility restrictions, each with the control its values deserve:
 * a country picker where the vocabulary is closed (ISO 3166), labelled
 * suggestions where a standard exists but deployments extend it (eduPerson
 * affiliations, SCHAC organization types, REFEDS assurance), and a plain tag
 * input where the value is free by nature (email regexes, identity sources).
 *
 * Tags rather than one comma-separated box throughout: a regex may itself
 * contain a comma (`.{1,3}`), which a comma-split turns into two patterns that
 * match nobody.
 *
 * The plainer `MembershipRestrictionFormItems` still serves the customer and
 * project panels, which write the same six columns.
 *
 * Each row is tied to the user attribute it is matched against, and a
 * deployment that does not collect that attribute does not get the row -- the
 * same gate the applicant-visibility table applies. A restriction already
 * stored on such an attribute is the exception: the backend keeps evaluating
 * it, so it would turn every applicant away from behind a hidden row. Those
 * stay visible, carrying a warning. */
export const EligibilityRestrictionFormItems: FC<
  EligibilityRestrictionFormItemsProps
> = ({ disabled }) => {
  const affiliationOptions = useMemo(getAffiliationOptions, []);
  const organizationTypeOptions = useMemo(getOrganizationTypeOptions, []);
  const assuranceLevelOptions = useMemo(getAssuranceLevelOptions, []);

  const scope = useEditFieldContext()?.scope;

  const gate = (name: string, ...attributes: ProfileAttribute[]): RowGate => {
    if (attributes.some(isProfileAttributeEnabled)) {
      return { visible: true };
    }
    return {
      visible: getRestrictionsArray(scope?.[name]).length > 0,
      warnTooltip: translate(
        'This deployment does not collect this attribute, so no applicant can match these values. Clear them to stop turning every applicant away.',
      ),
    };
  };

  const rows: Record<string, RowGate> = {
    user_email_patterns: gate('user_email_patterns', 'email'),
    user_affiliations: gate('user_affiliations', 'affiliations'),
    user_identity_sources: gate('user_identity_sources', 'identity_source'),
    user_nationalities: gate(
      'user_nationalities',
      'nationality',
      'nationalities',
    ),
    user_organization_types: gate(
      'user_organization_types',
      'organization_type',
    ),
    user_assurance_levels: gate('user_assurance_levels', 'eduperson_assurance'),
  };

  const row = (name: string, field: ReactNode) =>
    rows[name].visible ? field : null;

  return (
    <>
      {row(
        'user_email_patterns',
        <RestrictionTagsEditField
          name="user_email_patterns"
          warnTooltip={rows.user_email_patterns.warnTooltip}
          label={translate('Email patterns')}
          description={translate(
            'Regular expressions matched against the applicant’s email, such as @university\\.example$',
          )}
          placeholder={translate('Type a pattern and press Enter')}
          disabled={disabled}
          emptyValue={[]}
          renderValue={(value) => (
            <RestrictionsValue values={getRestrictionsArray(value)} />
          )}
        />,
      )}
      {row(
        'user_affiliations',
        <RestrictionTagsEditField
          name="user_affiliations"
          warnTooltip={rows.user_affiliations.warnTooltip}
          label={translate('User affiliations')}
          description={translate(
            'Standard eduPerson values are suggested; scoped values can be typed in.',
          )}
          options={affiliationOptions}
          disabled={disabled}
          emptyValue={[]}
          renderValue={(value) => (
            <RestrictionsValue values={getRestrictionsArray(value)} />
          )}
        />,
      )}
      {row(
        'user_identity_sources',
        <RestrictionTagsEditField
          name="user_identity_sources"
          warnTooltip={rows.user_identity_sources.warnTooltip}
          label={translate('Identity sources')}
          description={translate(
            'The institution that authenticated the applicant, exactly as reported at login.',
          )}
          placeholder={translate('Type an identity source and press Enter')}
          disabled={disabled}
          emptyValue={[]}
          renderValue={(value) => (
            <RestrictionsValue values={getRestrictionsArray(value)} />
          )}
        />,
      )}
      {row(
        'user_nationalities',
        <MultiCountrySelectEditField
          name="user_nationalities"
          warnTooltip={rows.user_nationalities.warnTooltip}
          label={translate('Nationalities')}
          description={translate(
            'An extra requirement on top of the email, affiliation and identity group.',
          )}
          disabled={disabled}
          emptyValue={[]}
          renderValue={(value) => (
            <RestrictionsValue values={getRestrictionsArray(value)} />
          )}
        />,
      )}
      {row(
        'user_organization_types',
        <RestrictionTagsEditField
          name="user_organization_types"
          warnTooltip={rows.user_organization_types.warnTooltip}
          label={translate('Organization types')}
          description={translate(
            'An extra requirement on top of the email, affiliation and identity group.',
          )}
          options={organizationTypeOptions}
          disabled={disabled}
          emptyValue={[]}
          renderValue={(value) => (
            <RestrictionsValue
              values={getRestrictionsArray(value).map(formatOrganizationType)}
            />
          )}
        />,
      )}
      {row(
        'user_assurance_levels',
        <RestrictionTagsEditField
          name="user_assurance_levels"
          warnTooltip={rows.user_assurance_levels.warnTooltip}
          label={translate('Assurance levels')}
          description={translate(
            'The applicant must hold every level listed, not just one of them.',
          )}
          options={assuranceLevelOptions}
          disabled={disabled}
          emptyValue={[]}
          renderValue={(value) => (
            <RestrictionsValue
              values={getRestrictionsArray(value).map(formatAssuranceUri)}
            />
          )}
        />,
      )}
    </>
  );
};
