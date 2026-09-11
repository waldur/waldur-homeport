import { FC } from 'react';

import { required } from '@/core/validators';
import { CommaSeparatedListGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { WizardForm, WizardFormStepProps } from '@/wizard';

import { UserClaimsField } from './UserClaimsField';
import { validateEmailPatterns } from './utils';

/** Step 1: who the rule applies to.
 *
 * Every filter lives here, which is the bulk of the form. They are all
 * optional and combine as documented on each control, so the step carries no
 * validation of its own beyond the rule name.
 */
export const RuleStepMatching: FC<WizardFormStepProps> = (props) => (
  <WizardForm {...props}>
    <StringGroup
      name="name"
      placeholder={translate('e.g. Default users')}
      validate={required}
      label={translate('Rule name')}
      required
    />
    <CommaSeparatedListGroup
      label={translate('Affiliations')}
      name="user_affiliations"
      placeholder="student, faculty, researcher (comma-separated)"
      description={translate('Enter comma-separated affiliation identifiers')}
    />
    <CommaSeparatedListGroup
      label={translate('Email patterns')}
      name="user_email_patterns"
      placeholder={translate('e.g. .*@example.com')}
      description={translate(
        'Enter space separated regex pattern to match user email',
      )}
      separator="space"
      validate={validateEmailPatterns}
    />
    <CommaSeparatedListGroup
      label={translate('Identity sources')}
      name="user_identity_sources"
      placeholder="eduGAIN, haka, surfconext"
      description={translate(
        'Users authenticated via any of these identity providers will match.',
      )}
    />
    <UserClaimsField />
    <CommaSeparatedListGroup
      label={translate('Nationalities')}
      name="user_nationalities"
      placeholder="DE, FR, US"
      description={translate(
        'ISO 3166-1 alpha-2 codes. Users with any of these nationalities will match.',
      )}
    />
    <CommaSeparatedListGroup
      label={translate('Organization types')}
      name="user_organization_types"
      placeholder="urn:schac:homeOrganizationType:int:university"
      description={translate(
        'SCHAC organization type URNs. Users from an organization of any of these types will match.',
      )}
    />
    <CommaSeparatedListGroup
      label={translate('Assurance levels')}
      name="user_assurance_levels"
      placeholder="https://refeds.org/assurance/IAP/medium"
      description={translate(
        'Users must hold ALL of these assurance levels to match.',
      )}
    />
  </WizardForm>
);
