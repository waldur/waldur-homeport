import { Field, useFormState } from 'react-final-form';

import { validateEmailPatterns } from '@waldur/administration/auto-provisioning-rules/utils';
import { AccordionCard } from '@waldur/core/AccordionCard';
import { CommaSeparatedListField } from '@waldur/form/CommaSeparatedListField';
import { FormFieldError } from '@waldur/form/FormFieldError';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

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
      <FormGroup
        label={translate('Allowed email patterns')}
        description={translate(
          'Enter space separated regex pattern to match user email',
        )}
      >
        <Field
          name="user_email_patterns"
          component={CommaSeparatedListField as any}
          validate={validateEmailPatterns}
          placeholder={translate('e.g. .*@example.com')}
          disabled={disabled}
          separator="space"
        />
        <FormFieldError name="user_email_patterns" />
      </FormGroup>

      <FormGroup
        label={translate('Allowed affiliations')}
        description={translate('Enter comma-separated affiliation identifiers')}
        spaceless
      >
        <Field
          name="user_affiliations"
          component={CommaSeparatedListField as any}
          placeholder="student, faculty, researcher (comma-separated)"
          disabled={disabled}
        />
      </FormGroup>
    </AccordionCard>
  );
};
