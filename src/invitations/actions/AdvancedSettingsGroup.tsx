import { Field, useFormState } from 'react-final-form';

import { validateEmailPatterns } from '@/administration/auto-provisioning-rules/utils';
import { AccordionCard } from '@/core/AccordionCard';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { CommaSeparatedListField } from '@/form/CommaSeparatedListField';
import { FormFieldError } from '@/form/FormFieldError';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

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
      <FormGroup>
        <Field
          name="auto_approve"
          render={({ input }) => (
            <AwesomeCheckboxField
              label={translate('Auto-approve permission requests')}
              description={translate(
                'Automatically approve permission requests from users matching the specified rules.',
              )}
              alignMiddle
              disabled={disabled}
              input={input}
            />
          )}
        />
      </FormGroup>
      <FormGroup
        label={translate('Additional email patterns')}
        description={translate(
          'Enter space-separated regex patterns. These are applied in addition to any existing restrictions.',
        )}
      >
        <Field
          name="user_email_patterns"
          component={CommaSeparatedListField}
          validate={validateEmailPatterns}
          placeholder={translate('e.g. .*@example.com')}
          disabled={disabled}
          separator="space"
        />
        <FormFieldError name="user_email_patterns" />
      </FormGroup>

      <FormGroup
        label={translate('Additional affiliations')}
        description={translate(
          'Enter comma-separated affiliation identifiers. These are applied in addition to any existing restrictions.',
        )}
      >
        <Field
          name="user_affiliations"
          component={CommaSeparatedListField}
          placeholder="student, faculty, researcher (comma-separated)"
          disabled={disabled}
        />
      </FormGroup>

      <FormGroup
        label={translate('Required nationalities')}
        description={translate(
          'Enter comma-separated ISO country codes. Users with any of these nationalities will be allowed.',
        )}
      >
        <Field
          name="user_nationalities"
          component={CommaSeparatedListField}
          placeholder={translate('e.g. DE, FR, US (comma-separated)')}
          disabled={disabled}
        />
      </FormGroup>

      <FormGroup
        label={translate('Required organization types')}
        description={translate(
          'Enter comma-separated SCHAC organization type URNs.',
        )}
      >
        <Field
          name="user_organization_types"
          component={CommaSeparatedListField}
          placeholder={translate(
            'e.g. urn:schac:homeOrganizationType:int:university',
          )}
          disabled={disabled}
        />
      </FormGroup>

      <FormGroup
        label={translate('Required assurance levels')}
        description={translate(
          'Enter comma-separated REFEDS assurance URIs. Users must have ALL of these levels.',
        )}
        spaceless
      >
        <Field
          name="user_assurance_levels"
          component={CommaSeparatedListField}
          placeholder={translate(
            'e.g. https://refeds.org/assurance/IAP/medium',
          )}
          disabled={disabled}
        />
      </FormGroup>
    </AccordionCard>
  );
};
