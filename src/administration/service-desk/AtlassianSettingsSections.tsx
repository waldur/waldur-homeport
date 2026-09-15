import { useFormState } from 'react-final-form';

import { AccordionCard } from '@/core/AccordionCard';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';

import {
  ATLASSIAN_CREDENTIAL_FIELDS,
  AtlassianAuthMethod,
  AUTH_METHOD_FIELD,
  getAtlassianAuthMethodChoices,
  getAtlassianAuthMethodLabel,
} from './atlassianAuth';
import { SettingField } from './SettingField';

const getSections = () => [
  {
    title: translate('Service desk'),
    keys: [
      'ATLASSIAN_PROJECT_ID',
      'ATLASSIAN_DEFAULT_OFFERING_ISSUE_TYPE',
      'ATLASSIAN_EXCLUDED_ATTACHMENT_TYPES',
      'ATLASSIAN_SHARED_USERNAME',
      'ATLASSIAN_MAP_WALDUR_USERS_TO_SERVICEDESK_AGENTS',
      'ATLASSIAN_USE_OLD_API',
    ],
  },
  {
    title: translate('Templates'),
    keys: ['ATLASSIAN_SUMMARY_TEMPLATE', 'ATLASSIAN_DESCRIPTION_TEMPLATE'],
  },
  {
    title: translate('Custom field mapping'),
    keys: [
      'ATLASSIAN_CUSTOM_ISSUE_FIELD_MAPPING_ENABLED',
      'ATLASSIAN_REPORTER_FIELD',
      'ATLASSIAN_CALLER_FIELD',
      'ATLASSIAN_IMPACT_FIELD',
      'ATLASSIAN_ORGANISATION_FIELD',
      'ATLASSIAN_PROJECT_FIELD',
      'ATLASSIAN_AFFECTED_RESOURCE_FIELD',
      'ATLASSIAN_TEMPLATE_FIELD',
      'ATLASSIAN_WALDUR_BACKEND_ID_FIELD',
      'ATLASSIAN_SLA_FIELD',
      'ATLASSIAN_RESOLUTION_SLA_FIELD',
      'ATLASSIAN_SATISFACTION_FIELD',
      'ATLASSIAN_REQUEST_FEEDBACK_FIELD',
      'ATLASSIAN_LINKED_ISSUE_TYPE',
    ],
  },
  {
    title: translate('Webhook'),
    keys: ['JIRA_WEBHOOK_SHARED_SECRET'],
  },
];

const CONNECTION_SETTINGS = ['ATLASSIAN_API_URL', 'ATLASSIAN_VERIFY_SSL'];

const getAuthMethodOptions = () => [
  ...getAtlassianAuthMethodChoices().map(({ value, label }) => ({
    value,
    label,
  })),
  {
    value: 'oauth2_access_token',
    label: getAtlassianAuthMethodLabel('oauth2_access_token'),
  },
];

/** Atlassian settings grouped into sections; only the chosen method's credentials. */
export const AtlassianSettingsSections = ({ fields }) => {
  const { values } = useFormState();
  const fieldsByKey = Object.fromEntries(
    fields.map((field) => [field.key, field]),
  );
  const renderSettings = (keys: string[]) =>
    keys
      .filter((key) => fieldsByKey[key])
      .map((key) => <SettingField key={key} field={fieldsByKey[key]} />);

  const method = values[AUTH_METHOD_FIELD] as AtlassianAuthMethod;
  const sections = getSections();
  const placed = new Set([
    ...CONNECTION_SETTINGS,
    ...Object.values(ATLASSIAN_CREDENTIAL_FIELDS).flat(),
    ...sections.flatMap((section) => section.keys),
  ]);
  // Settings added later still show up, even before they get a section.
  const otherSettings = fields
    .map((field) => field.key)
    .filter((key) => !placed.has(key));

  return (
    <div className="d-flex flex-column gap-5">
      <AccordionCard title={translate('Connection and sign-in')} defaultOpen>
        {renderSettings(['ATLASSIAN_API_URL'])}
        <SelectGroup
          name={AUTH_METHOD_FIELD}
          label={translate('Authentication method')}
          description={translate(
            'Only the credentials of the selected method are kept; the others are cleared on update.',
          )}
          options={getAuthMethodOptions()}
          simpleValue
          isClearable={false}
        />
        {renderSettings(ATLASSIAN_CREDENTIAL_FIELDS[method] || [])}
        {renderSettings(['ATLASSIAN_VERIFY_SSL'])}
      </AccordionCard>
      {sections.map((section) => {
        const settings = renderSettings(section.keys);
        return settings.length ? (
          <AccordionCard key={section.title} title={section.title}>
            {settings}
          </AccordionCard>
        ) : null;
      })}
      {otherSettings.length > 0 && (
        <AccordionCard title={translate('Other')} defaultOpen>
          {renderSettings(otherSettings)}
        </AccordionCard>
      )}
    </div>
  );
};
