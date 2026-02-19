import { SecretField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';

interface KeycloakField {
  key: string;
  label: string;
  description: string;
  isSecret: boolean;
  component: any;
  isCheckbox?: boolean;
}

export const KEYCLOAK_FIELDS: KeycloakField[] = [
  {
    key: 'secret_options.keycloak_url',
    label: translate('Keycloak URL'),
    description: translate(
      'Base URL of the Keycloak server, e.g. https://keycloak.example.com/',
    ),
    isSecret: false,
    component: StringField,
  },
  {
    key: 'secret_options.keycloak_realm',
    label: translate('Keycloak realm'),
    description: translate('Realm where groups and users are managed.'),
    isSecret: false,
    component: StringField,
  },
  {
    key: 'secret_options.keycloak_user_realm',
    label: translate('Keycloak user realm'),
    description: translate(
      'Realm used for admin authentication. Defaults to "master" if empty.',
    ),
    isSecret: false,
    component: StringField,
  },
  {
    key: 'secret_options.keycloak_username',
    label: translate('Keycloak username'),
    description: translate('Admin username for Keycloak API access.'),
    isSecret: false,
    component: StringField,
  },
  {
    key: 'secret_options.keycloak_password',
    label: translate('Keycloak password'),
    description: translate('Admin password for Keycloak API access.'),
    isSecret: true,
    component: SecretField,
  },
  {
    key: 'secret_options.keycloak_ssl_verify',
    label: translate('Verify SSL'),
    description: translate(
      'Verify SSL certificates when connecting to Keycloak. Disable only for development.',
    ),
    isSecret: false,
    component: AwesomeCheckboxField,
    isCheckbox: true,
  },
  {
    key: 'plugin_options.keycloak_base_group',
    label: translate('Base group'),
    description: translate(
      'Root parent group in Keycloak. Groups are organized as: {base_group}/{offering_slug}/{role_group}. Leave empty to use {offering_slug} at the realm root. Recommended when multiple offerings share one Keycloak instance.',
    ),
    isSecret: false,
    component: StringField,
  },
  {
    key: 'plugin_options.keycloak_group_name_template',
    label: translate('Group name template'),
    description: translate(
      'Template for role group names within the offering hierarchy. Variables: {offering_uuid}, {offering_name}, {offering_slug}, {resource_uuid}, {resource_name}, {resource_slug}, {project_uuid}, {project_name}, {project_slug}, {organization_uuid}, {organization_name}, {organization_slug}, {role_name}, {scope_id}. Default: {offering_uuid}_{role_name}.',
    ),
    isSecret: false,
    component: StringField,
  },
  {
    key: 'plugin_options.keycloak_sync_frequency',
    label: translate('Sync frequency (minutes)'),
    description: translate(
      'How often memberships are synced with Keycloak, in minutes. Default: 15.',
    ),
    isSecret: false,
    component: StringField,
  },
];
