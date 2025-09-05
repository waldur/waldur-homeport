import { useSelector } from 'react-redux';
import { formValueSelector, Field } from 'redux-form';

import { validateEmailPatterns } from '@waldur/administration/auto-provisioning-rules/utils';
import { AccordionCard } from '@waldur/core/AccordionCard';
import { FormGroup } from '@waldur/form';
import { CommaSeparatedListField } from '@waldur/form/CommaSeparatedListField';
import { translate } from '@waldur/i18n';
import { type RootState } from '@waldur/store/reducers';

import { GROUP_INVITATION_CREATE_FORM_ID } from './constants';

export const AdvancedSettingsGroup = ({ disabled }) => {
  const role = useSelector((state: RootState) =>
    formValueSelector(GROUP_INVITATION_CREATE_FORM_ID)(state, 'role'),
  );
  const projectEnabled = role?.content_type === 'project';
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
      <Field
        name="user_email_patterns"
        component={FormGroup}
        label={translate('Allowed email patterns')}
        placeholder={translate('e.g.') + ' .*@example.com'}
        description={translate(
          'Enter space separated regex pattern to match user email',
        )}
        disabled={disabled}
        validate={validateEmailPatterns}
        space={5}
      >
        <CommaSeparatedListField separator="space" />
      </Field>

      <Field
        name="user_affiliations"
        component={FormGroup}
        label={translate('Allowed affiliations')}
        placeholder="student, faculty, researcher (comma-separated)"
        description={translate('Enter comma-separated affiliation identifiers')}
        disabled={disabled}
        spaceless
      >
        <CommaSeparatedListField />
      </Field>
    </AccordionCard>
  );
};
