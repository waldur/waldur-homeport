import { FeaturesEnum, UserFeatures } from '@/FeaturesEnums';
import { SwitchField } from '@/form/SwitchField';
import { translate } from '@/i18n';
import { ProfileAttribute } from '@/user/support/profileAttributes';

interface AttributeFieldDef {
  key: string;
  label: string;
  description?: string;
  component: any;
  hideLabel?: boolean;
  attribute?: ProfileAttribute;
  featureFlag?: FeaturesEnum;
}

export const ALL_ATTRIBUTE_FIELDS: AttributeFieldDef[] = [
  {
    key: 'expose_username',
    label: translate('Username'),
    description: translate("User's username"),
    component: SwitchField,
  },
  {
    key: 'expose_registration_method',
    label: translate('Registration method'),
    description: translate('How the user registered (e.g. eduTEAMS, local)'),
    component: SwitchField,
  },
  {
    key: 'expose_full_name',
    label: translate('Full name'),
    description: translate("User's full name"),
    component: SwitchField,
  },
  {
    key: 'expose_email',
    label: translate('Email'),
    description: translate("User's email address"),
    component: SwitchField,
  },
  {
    key: 'expose_phone_number',
    label: translate('Phone number'),
    description: translate("User's phone number"),
    component: SwitchField,
    attribute: 'phone_number',
  },
  {
    key: 'expose_organization',
    label: translate('Organization'),
    description: translate("User's organization"),
    component: SwitchField,
    attribute: 'organization',
  },
  {
    key: 'expose_job_title',
    label: translate('Job title'),
    description: translate("User's job title"),
    component: SwitchField,
    attribute: 'job_title',
  },
  {
    key: 'expose_affiliations',
    label: translate('Affiliations'),
    description: translate("User's affiliations"),
    component: SwitchField,
    attribute: 'affiliations',
  },
  {
    key: 'expose_gender',
    label: translate('Gender'),
    description: translate("User's gender (male, female, or unknown)"),
    component: SwitchField,
    attribute: 'gender',
  },
  {
    key: 'expose_personal_title',
    label: translate('Personal title'),
    description: translate('Honorific title'),
    component: SwitchField,
    attribute: 'personal_title',
  },
  {
    key: 'expose_place_of_birth',
    label: translate('Place of birth'),
    description: translate("User's place of birth"),
    component: SwitchField,
    attribute: 'place_of_birth',
  },
  {
    key: 'expose_address',
    label: translate('Address'),
    description: translate("User's postal address"),
    component: SwitchField,
  },
  {
    key: 'expose_country_of_residence',
    label: translate('Country of residence'),
    description: translate("User's country of residence"),
    component: SwitchField,
    attribute: 'country_of_residence',
  },
  {
    key: 'expose_nationality',
    label: translate('Nationality'),
    description: translate('Primary nationality'),
    component: SwitchField,
    attribute: 'nationality',
  },
  {
    key: 'expose_nationalities',
    label: translate('Nationalities'),
    description: translate('All citizenships'),
    component: SwitchField,
    attribute: 'nationalities',
  },
  {
    key: 'expose_organization_country',
    label: translate('Organization country'),
    description: translate("Organization's country"),
    component: SwitchField,
    attribute: 'organization_country',
  },
  {
    key: 'expose_organization_type',
    label: translate('Organization type'),
    description: translate('Organization type (SCHAC URN)'),
    component: SwitchField,
    attribute: 'organization_type',
  },
  {
    key: 'expose_organization_registry_code',
    label: translate('Organization registry code'),
    description: translate("Organization's registry code"),
    component: SwitchField,
    attribute: 'organization_registry_code',
  },
  {
    key: 'expose_organization_vat_code',
    label: translate('Organization VAT code'),
    description: translate("Organization's VAT code"),
    component: SwitchField,
    attribute: 'organization_vat_code',
  },
  {
    key: 'expose_organization_address',
    label: translate('Organization address'),
    description: translate("Organization's postal address"),
    component: SwitchField,
    attribute: 'organization_address',
  },
  {
    key: 'expose_eduperson_assurance',
    label: translate('eduPerson assurance'),
    description: translate('REFEDS assurance level'),
    component: SwitchField,
    attribute: 'eduperson_assurance',
  },
  {
    key: 'expose_civil_number',
    label: translate('Civil number'),
    description: translate('Civil/national ID number'),
    component: SwitchField,
    attribute: 'civil_number',
  },
  {
    key: 'expose_birth_date',
    label: translate('Birth date'),
    description: translate('Date of birth'),
    component: SwitchField,
    attribute: 'birth_date',
  },
  {
    key: 'expose_identity_source',
    label: translate('Identity source'),
    description: translate('Identity provider source'),
    component: SwitchField,
  },
  {
    key: 'expose_active_isds',
    label: translate('Active ISDs'),
    description: translate('Active identity source declarations'),
    component: SwitchField,
    featureFlag: UserFeatures.show_identity_bridge,
  },
  {
    key: 'expose_uid_number',
    label: translate('POSIX UID'),
    description: translate(
      'POSIX UID from the identity provider; exposed for offerings that source UIDs from the user attribute',
    ),
    component: SwitchField,
    attribute: 'uid_number',
  },
  {
    key: 'expose_primary_gid',
    label: translate('POSIX primary GID'),
    description: translate(
      'POSIX primary GID from the identity provider; exposed for offerings that source primary GIDs from the user attribute',
    ),
    component: SwitchField,
    attribute: 'primary_gid',
  },
];
