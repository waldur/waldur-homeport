import {
  FormContainer,
  SecretField,
  StringField,
  TextField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { EmailField } from '@waldur/form/EmailField';
import { translate } from '@waldur/i18n';

export const AtlassianSettings = () => (
  <FormContainer submitting={false} clearOnUnmount={false} floating={true}>
    <StringField
      name="ATLASSIAN_API_URL"
      label={translate('API URL')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_USERNAME"
      label={translate('Username')}
      maxLength={150}
    />
    <SecretField
      name="ATLASSIAN_PASSWORD"
      label={translate('Password')}
      maxLength={150}
      floating={false}
    />
    <EmailField
      name="ATLASSIAN_EMAIL"
      label={translate('Email')}
      maxLength={75}
    />
    <SecretField
      name="ATLASSIAN_TOKEN"
      label={translate('Token')}
      maxLength={150}
      floating={false}
    />
    <StringField
      name="ATLASSIAN_PROJECT_ID"
      label={translate('Project ID')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_DEFAULT_OFFERING_ISSUE_TYPE"
      label={translate('Default offering issue type')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_EXCLUDED_ATTACHMENT_TYPES"
      label={translate('List of excluded attachment types')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_ISSUE_TYPES"
      label={translate('Issue types')}
      placeholder={translate('Comma seperated issue types')}
    />
    <TextField
      name="ATLASSIAN_DESCRIPTION_TEMPLATE"
      label={translate('Description template')}
      maxLength={150}
    />
    <TextField
      name="ATLASSIAN_SUMMARY_TEMPLATE"
      label={translate('Summary template')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_AFFECTED_RESOURCE_FIELD"
      label={translate('Affected resource field name')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_IMPACT_FIELD"
      label={translate('Impact field name')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_ORGANISATION_FIELD"
      label={translate('Organisation field name')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_RESOLUTION_SLA_FIELD"
      label={translate('Resolution SLA field name')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_PROJECT_FIELD"
      label={translate('Project field name')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_REPORTER_FIELD"
      label={translate('Reporter field name')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_CALLER_FIELD"
      label={translate('Caller field name')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_SLA_FIELD"
      label={translate('SLA field name')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_LINKED_ISSUE_TYPE"
      label={translate('Type of linked issue')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_SATISFACTION_FIELD"
      label={translate('Satisfaction field name')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_REQUEST_FEEDBACK_FIELD"
      label={translate('Issue request feedback field name')}
      maxLength={150}
    />
    <StringField
      name="ATLASSIAN_TEMPLATE_FIELD"
      label={translate('Template field name')}
      maxLength={150}
    />
    <AwesomeCheckboxField
      hideLabel
      name="ATLASSIAN_USE_OLD_API"
      className="mt-3"
      label={translate('Use old API')}
    />
    <AwesomeCheckboxField
      hideLabel
      name="ATLASSIAN_USE_TEENAGE_API"
      className="mt-3"
      label={translate('Use teenage API')}
    />
    <AwesomeCheckboxField
      hideLabel
      name="ATLASSIAN_USE_AUTOMATIC_REQUEST_MAPPING"
      className="mt-3"
      label={translate('Use automatic request mapping')}
    />
    <AwesomeCheckboxField
      hideLabel
      name="ATLASSIAN_MAP_WALDUR_USERS_TO_SERVICEDESK_AGENTS"
      className="mt-3"
      label={translate('Map waldur users to service desk agents')}
    />
    <AwesomeCheckboxField
      hideLabel
      name="ATLASSIAN_VERIFY_SSL"
      className="mt-3"
      label={translate('Verify SSL')}
    />
    <AwesomeCheckboxField
      hideLabel
      name="ATLASSIAN_PULL_PRIORITIES"
      className="mt-3"
      label={translate('Pull priorities')}
    />
    <AwesomeCheckboxField
      hideLabel
      name="ATLASSIAN_SHARED_USERNAME"
      className="mt-3"
      label={translate('Is Service Desk username the same as in Waldur')}
    />
    <AwesomeCheckboxField
      hideLabel
      name="ATLASSIAN_CUSTOM_ISSUE_FIELD_MAPPING_ENABLED"
      className="mt-3"
      label={translate('Should extra issue field mappings be applied')}
    />
  </FormContainer>
);
