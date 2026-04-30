import { FeaturesEnum, UserFeatures } from '@/FeaturesEnums';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { OfferingEditField } from '@/marketplace/offerings/update/DefaultOfferingEditPanel';
import { ProfileAttribute } from '@/user/support/profileAttributes';

interface AttributeFieldDef extends OfferingEditField {
  attribute?: ProfileAttribute;
  featureFlag?: FeaturesEnum;
}

export const ALL_ATTRIBUTE_FIELDS: AttributeFieldDef[] = [
  {
    key: 'expose_username',
    label: translate('Username'),
    description: translate("User's username"),
    component: AwesomeCheckboxField,
  },
  {
    key: 'expose_registration_method',
    label: translate('Registration method'),
    description: translate('How the user registered (e.g. eduTEAMS, local)'),
    component: AwesomeCheckboxField,
  },
  {
    key: 'expose_full_name',
    label: translate('Full name'),
    description: translate("User's full name"),
    component: AwesomeCheckboxField,
  },
  {
    key: 'expose_email',
    label: translate('Email'),
    description: translate("User's email address"),
    component: AwesomeCheckboxField,
  },
  {
    key: 'expose_phone_number',
    label: translate('Phone number'),
    description: translate("User's phone number"),
    component: AwesomeCheckboxField,
    attribute: 'phone_number',
  },
  {
    key: 'expose_organization',
    label: translate('Organization'),
    description: translate("User's organization"),
    component: AwesomeCheckboxField,
    attribute: 'organization',
  },
  {
    key: 'expose_job_title',
    label: translate('Job title'),
    description: translate("User's job title"),
    component: AwesomeCheckboxField,
    attribute: 'job_title',
  },
  {
    key: 'expose_affiliations',
    label: translate('Affiliations'),
    description: translate("User's affiliations"),
    component: AwesomeCheckboxField,
    attribute: 'affiliations',
  },
  {
    key: 'expose_gender',
    label: translate('Gender'),
    description: translate("User's gender (male, female, or unknown)"),
    component: AwesomeCheckboxField,
    attribute: 'gender',
  },
  {
    key: 'expose_personal_title',
    label: translate('Personal title'),
    description: translate('Honorific title'),
    component: AwesomeCheckboxField,
    attribute: 'personal_title',
  },
  {
    key: 'expose_place_of_birth',
    label: translate('Place of birth'),
    description: translate("User's place of birth"),
    component: AwesomeCheckboxField,
    attribute: 'place_of_birth',
  },
  {
    key: 'expose_address',
    label: translate('Address'),
    description: translate("User's postal address"),
    component: AwesomeCheckboxField,
  },
  {
    key: 'expose_country_of_residence',
    label: translate('Country of residence'),
    description: translate("User's country of residence"),
    component: AwesomeCheckboxField,
    attribute: 'country_of_residence',
  },
  {
    key: 'expose_nationality',
    label: translate('Nationality'),
    description: translate('Primary nationality'),
    component: AwesomeCheckboxField,
    attribute: 'nationality',
  },
  {
    key: 'expose_nationalities',
    label: translate('Nationalities'),
    description: translate('All citizenships'),
    component: AwesomeCheckboxField,
    attribute: 'nationalities',
  },
  {
    key: 'expose_organization_country',
    label: translate('Organization country'),
    description: translate("Organization's country"),
    component: AwesomeCheckboxField,
    attribute: 'organization_country',
  },
  {
    key: 'expose_organization_type',
    label: translate('Organization type'),
    description: translate('Organization type (SCHAC URN)'),
    component: AwesomeCheckboxField,
    attribute: 'organization_type',
  },
  {
    key: 'expose_organization_registry_code',
    label: translate('Organization registry code'),
    description: translate("Organization's registry code"),
    component: AwesomeCheckboxField,
    attribute: 'organization_registry_code',
  },
  {
    key: 'expose_eduperson_assurance',
    label: translate('eduPerson assurance'),
    description: translate('REFEDS assurance level'),
    component: AwesomeCheckboxField,
    attribute: 'eduperson_assurance',
  },
  {
    key: 'expose_civil_number',
    label: translate('Civil number'),
    description: translate('Civil/national ID number'),
    component: AwesomeCheckboxField,
    attribute: 'civil_number',
  },
  {
    key: 'expose_birth_date',
    label: translate('Birth date'),
    description: translate('Date of birth'),
    component: AwesomeCheckboxField,
    attribute: 'birth_date',
  },
  {
    key: 'expose_identity_source',
    label: translate('Identity source'),
    description: translate('Identity provider source'),
    component: AwesomeCheckboxField,
  },
  {
    key: 'expose_active_isds',
    label: translate('Active ISDs'),
    description: translate('Active identity source declarations'),
    component: AwesomeCheckboxField,
    featureFlag: UserFeatures.show_identity_bridge,
  },
];
