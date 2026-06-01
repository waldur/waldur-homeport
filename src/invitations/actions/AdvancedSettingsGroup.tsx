import { useFormState } from 'react-final-form';

import { validateEmailPatterns } from '@/administration/auto-provisioning-rules/utils';
import { AccordionCard } from '@/core/AccordionCard';
import { BooleanGroup, CommaSeparatedListGroup } from '@/form';
import { translate } from '@/i18n';

export const AdvancedSettingsGroup = ({ disabled }) => {
  const { values } = useFormState();
  const projectEnabled = values?.role?.content_type === 'project';

  if (!projectEnabled) {
    return null;
  }

  return (
    <AccordionCard
      title={translate('Advanced settings')}
      size="sm"
      className="mb-5 bg-gray-50"
      titleClassName="fs-6"
    >
      <BooleanGroup
        name="auto_approve"
        label={translate('Auto-approve permission requests')}
        description={translate(
          'Automatically approve permission requests from users matching the specified rules.',
        )}
        alignMiddle
        disabled={disabled}
      />
      <CommaSeparatedListGroup
        label={translate('Additional email patterns')}
        description={translate(
          'Enter space-separated regex patterns. These are applied in addition to any existing restrictions.',
        )}
        name="user_email_patterns"
        validate={validateEmailPatterns}
        placeholder={translate('e.g. .*@example.com')}
        disabled={disabled}
        separator="space"
      />
      <CommaSeparatedListGroup
        label={translate('Additional affiliations')}
        description={translate(
          'Enter comma-separated affiliation identifiers. These are applied in addition to any existing restrictions.',
        )}
        name="user_affiliations"
        placeholder="student, faculty, researcher (comma-separated)"
        disabled={disabled}
      />
      <CommaSeparatedListGroup
        label={translate('Required nationalities')}
        description={translate(
          'Enter comma-separated ISO country codes. Users with any of these nationalities will be allowed.',
        )}
        name="user_nationalities"
        placeholder={translate('e.g. DE, FR, US (comma-separated)')}
        disabled={disabled}
      />
      <CommaSeparatedListGroup
        label={translate('Required organization types')}
        description={translate(
          'Enter comma-separated SCHAC organization type URNs.',
        )}
        name="user_organization_types"
        placeholder={translate(
          'e.g. urn:schac:homeOrganizationType:int:university',
        )}
        disabled={disabled}
      />
      <CommaSeparatedListGroup
        label={translate('Required assurance levels')}
        description={translate(
          'Enter comma-separated REFEDS assurance URIs. Users must have ALL of these levels.',
        )}
        spaceless
        name="user_assurance_levels"
        placeholder={translate('e.g. https://refeds.org/assurance/IAP/medium')}
        disabled={disabled}
      />
    </AccordionCard>
  );
};
