import { Fragment, ReactNode, useCallback, useMemo } from 'react';
import { User } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatDate, formatDateTime } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { StaffOnlyIndicator } from '@/customer/details/StaffOnlyIndicator';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import {
  BooleanEditField,
  CountryEditField,
  DateEditField,
  EditFieldProvider,
  MultiCountrySelectEditField,
  PhoneNumberEditField,
  SelectEditField,
  StringEditField,
  TextEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { TabbedSection } from '@/form/TabbedSection';
import { translate } from '@/i18n';
import { CountryFlag } from '@/marketplace/common/CountryFlag';
import { useModal } from '@/modal/actions';
import { formatUserStatus } from '@/user/support/utils';
import { useUser } from '@/workspace/hooks';

import {
  formatAssuranceUri,
  getGenderChoices,
  getOrganizationTypeOptions,
  getPersonalTitleOptions,
} from './aai-constants';
import { ChangeEmailButton } from './ChangeEmailButton';
import { getProtectedFieldProps } from './getProtectedFieldProps';
import { isProfileAttributeEnabled } from './profileAttributes';
import { useProfileFieldWarnings } from './useProfileFieldWarnings';
import { UserEditAvatarFormItem } from './UserEditAvatarFormItem';
import { useUpdateUser } from './useUpdateUser';

const isRequired = (field: string) => {
  return (
    (ENV.plugins.WALDUR_CORE.USER_MANDATORY_FIELDS || []).includes(field) ||
    (ENV.plugins.WALDUR_CORE.MANDATORY_USER_ATTRIBUTES || []).includes(field)
  );
};

interface TabStats {
  total: number;
  missingMandatory: number;
  missingMandatoryFields: string[];
}

const hasValue = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// A single profile field: the same descriptor drives both the rendered field
// and the tab counter/badge, so the count can never drift from what is shown.
interface ProfileField {
  // Attribute name; used for the mandatory check via isRequired().
  name: string;
  // Human label; used in the "missing required fields" tooltip.
  label: string;
  // Whether the field is shown (profile attribute / feature / value gating).
  enabled: boolean;
  // Current value; used to detect missing mandatory fields.
  value?: unknown;
  // Set false for rows that render but should not be counted (e.g. avatar).
  countable?: boolean;
  // The JSX rendered for this field.
  node: ReactNode;
}

interface FieldBuilderContext {
  user: User;
  currentUser: User;
  disabled: boolean;
  isSelf: boolean;
}

const computeStats = (fields: ProfileField[]): TabStats => {
  const enabled = fields.filter((f) => f.enabled);
  const missing = enabled.filter(
    (f) => isRequired(f.name) && !hasValue(f.value),
  );
  return {
    total: enabled.filter((f) => f.countable !== false).length,
    missingMandatory: missing.length,
    missingMandatoryFields: missing.map((f) => f.label),
  };
};

const TabBadge = ({ stats, tabKey }: { stats: TabStats; tabKey: string }) => {
  if (stats.missingMandatory > 0) {
    return (
      <Tip
        label={translate('Missing required fields: {fields}', {
          fields: stats.missingMandatoryFields.join(', '),
        })}
        id={`tab-badge-${tabKey}`}
      >
        <span
          className="badge badge-sm badge-circle badge-danger ms-2"
          data-testid="tab-badge-danger"
        >
          {stats.missingMandatory}
        </span>
      </Tip>
    );
  }
  return (
    <span
      className="badge badge-sm badge-circle badge-light ms-2"
      data-testid="tab-badge-total"
    >
      {stats.total}
    </span>
  );
};

const FieldList = ({
  fields,
  emptyMessage,
}: {
  fields: ProfileField[];
  emptyMessage?: string;
}) => {
  const visible = fields.filter((f) => f.enabled);
  if (visible.length === 0 && emptyMessage) {
    return <div className="text-muted text-center py-6">{emptyMessage}</div>;
  }
  return (
    <>
      {visible.map((f) => (
        <Fragment key={f.name}>{f.node}</Fragment>
      ))}
    </>
  );
};

const buildBasicFields = ({
  user,
  disabled,
  isSelf,
}: FieldBuilderContext): ProfileField[] => {
  const firstNameProps = getProtectedFieldProps(
    user,
    'first_name',
    isRequired('first_name'),
    user.first_name,
  );
  const lastNameProps = getProtectedFieldProps(
    user,
    'last_name',
    isRequired('last_name'),
    user.last_name,
  );
  const nativeNameProps = getProtectedFieldProps(
    user,
    'native_name',
    isRequired('native_name'),
    user.native_name,
  );
  const emailProps = getProtectedFieldProps(
    user,
    'email',
    isRequired('email'),
    user.email,
  );
  const phoneProps = getProtectedFieldProps(
    user,
    'phone_number',
    isRequired('phone_number'),
    user.phone_number,
  );

  return [
    {
      name: 'image',
      label: translate('Avatar'),
      enabled: true,
      countable: false,
      node: <UserEditAvatarFormItem user={user} disabled={disabled} />,
    },
    {
      name: 'first_name',
      label: translate('First name'),
      enabled: true,
      value: user.first_name,
      node: (
        <StringEditField
          name="first_name"
          label={translate('First name')}
          required={isRequired('first_name')}
          disabled={disabled || firstNameProps.isProtected}
          description={
            isSelf
              ? translate('Display your first name on your profile')
              : translate("Display the user's first name on their profile")
          }
          {...firstNameProps}
        />
      ),
    },
    {
      name: 'last_name',
      label: translate('Last name'),
      enabled: true,
      value: user.last_name,
      node: (
        <StringEditField
          name="last_name"
          label={translate('Last name')}
          required={isRequired('last_name')}
          disabled={disabled || lastNameProps.isProtected}
          description={
            isSelf
              ? translate('Display your last name on your profile')
              : translate("Display the user's last name on their profile")
          }
          {...lastNameProps}
        />
      ),
    },
    {
      name: 'native_name',
      label: translate('Native name'),
      enabled: isProfileAttributeEnabled('native_name'),
      value: user.native_name,
      node: (
        <StringEditField
          name="native_name"
          label={translate('Native name')}
          required={isRequired('native_name')}
          disabled={disabled || nativeNameProps.isProtected}
          {...nativeNameProps}
        />
      ),
    },
    {
      name: 'email',
      label: translate('Email'),
      enabled: true,
      value: user.email,
      node: (
        <FormTable.Item
          label={translate('Email')}
          value={
            emailProps.renderValue
              ? emailProps.renderValue(user.email)
              : user.email
          }
          required={isRequired('email')}
          description={
            isSelf
              ? translate('Provide an email address for notifications')
              : translate(
                  "Provide an email address for the user's notifications",
                )
          }
          actions={
            !emailProps.isProtected ? (
              <ChangeEmailButton user={user} disabled={disabled} />
            ) : null
          }
        />
      ),
    },
    {
      name: 'phone_number',
      label: translate('Phone number'),
      enabled: true,
      value: user.phone_number,
      node: (
        <PhoneNumberEditField
          name="phone_number"
          label={translate('Phone number')}
          required={isRequired('phone_number')}
          disabled={disabled || phoneProps.isProtected}
          description={translate(
            'International format with country code, e.g. +1 202 555 1234',
          )}
          {...phoneProps}
        />
      ),
    },
  ];
};

const buildPersonalFields = ({
  user,
  disabled,
  isSelf,
}: FieldBuilderContext): ProfileField[] => {
  const titleProps = getProtectedFieldProps(
    user,
    'personal_title',
    isRequired('personal_title'),
    user.personal_title,
  );
  const genderProps = getProtectedFieldProps(
    user,
    'gender',
    isRequired('gender'),
    user.gender,
  );
  const birthDateProps = getProtectedFieldProps(
    user,
    'birth_date',
    isRequired('birth_date'),
    user.birth_date,
  );
  const placeOfBirthProps = getProtectedFieldProps(
    user,
    'place_of_birth',
    isRequired('place_of_birth'),
    user.place_of_birth,
  );

  return [
    {
      name: 'personal_title',
      label: translate('Personal title'),
      enabled: isProfileAttributeEnabled('personal_title'),
      value: user.personal_title,
      node: (
        <SelectEditField
          name="personal_title"
          label={translate('Personal title')}
          options={getPersonalTitleOptions()}
          simpleValue
          required={isRequired('personal_title')}
          disabled={disabled || titleProps.isProtected}
          description={
            isSelf
              ? translate('Your honorific title (Mr, Ms, Dr, Prof, etc.)')
              : translate("The user's honorific title")
          }
          {...titleProps}
        />
      ),
    },
    {
      name: 'gender',
      label: translate('Gender'),
      enabled: isProfileAttributeEnabled('gender'),
      value: user.gender,
      node: (
        <SelectEditField
          name="gender"
          label={translate('Gender')}
          options={getGenderChoices()}
          simpleValue
          required={isRequired('gender')}
          disabled={disabled || genderProps.isProtected}
          description={
            isSelf ? translate('Your gender') : translate("The user's gender")
          }
          {...genderProps}
        />
      ),
    },
    {
      name: 'birth_date',
      label: translate('Birth date'),
      enabled: isProfileAttributeEnabled('birth_date'),
      value: user.birth_date,
      node: (
        <DateEditField
          name="birth_date"
          label={translate('Birth date')}
          required={isRequired('birth_date')}
          disabled={disabled || birthDateProps.isProtected}
          description={
            isSelf
              ? translate('Your date of birth')
              : translate("The user's date of birth")
          }
          renderValue={(val) => (val ? formatDate(val) : '')}
          {...birthDateProps}
        />
      ),
    },
    {
      name: 'place_of_birth',
      label: translate('Place of birth'),
      enabled: isProfileAttributeEnabled('place_of_birth'),
      value: user.place_of_birth,
      node: (
        <StringEditField
          name="place_of_birth"
          label={translate('Place of birth')}
          required={isRequired('place_of_birth')}
          disabled={disabled || placeOfBirthProps.isProtected}
          description={
            isSelf
              ? translate('Your place of birth')
              : translate("The user's place of birth")
          }
          {...placeOfBirthProps}
        />
      ),
    },
  ];
};

const buildGeographicFields = ({
  user,
  disabled,
  isSelf,
}: FieldBuilderContext): ProfileField[] => {
  const countryProps = getProtectedFieldProps(
    user,
    'country_of_residence',
    isRequired('country_of_residence'),
    user.country_of_residence,
  );
  const nationalityProps = getProtectedFieldProps(
    user,
    'nationality',
    isRequired('nationality'),
    user.nationality,
  );
  const nationalitiesProps = getProtectedFieldProps(
    user,
    'nationalities',
    isRequired('nationalities'),
    user.nationalities,
  );

  return [
    {
      name: 'country_of_residence',
      label: translate('Country of residence'),
      enabled: isProfileAttributeEnabled('country_of_residence'),
      value: user.country_of_residence,
      node: (
        <CountryEditField
          name="country_of_residence"
          label={translate('Country of residence')}
          required={isRequired('country_of_residence')}
          disabled={disabled || countryProps.isProtected}
          description={
            isSelf
              ? translate('Your current country of residence')
              : translate("The user's current country of residence")
          }
          {...countryProps}
          renderValue={
            countryProps.renderValue ||
            ((value) =>
              value ? (
                <>
                  <CountryFlag countryCode={value} fontSize={14} /> {value}
                </>
              ) : null)
          }
        />
      ),
    },
    {
      name: 'nationality',
      label: translate('Nationality'),
      enabled: isProfileAttributeEnabled('nationality'),
      value: user.nationality,
      node: (
        <CountryEditField
          name="nationality"
          label={translate('Nationality')}
          required={isRequired('nationality')}
          disabled={disabled || nationalityProps.isProtected}
          description={
            isSelf
              ? translate('Your primary nationality')
              : translate("The user's primary nationality")
          }
          {...nationalityProps}
          renderValue={
            nationalityProps.renderValue ||
            ((value) =>
              value ? (
                <>
                  <CountryFlag countryCode={value} fontSize={14} /> {value}
                </>
              ) : null)
          }
        />
      ),
    },
    {
      name: 'nationalities',
      label: translate('Nationalities'),
      enabled: isProfileAttributeEnabled('nationalities'),
      value: user.nationalities,
      node: (
        <MultiCountrySelectEditField
          name="nationalities"
          label={translate('Nationalities')}
          required={isRequired('nationalities')}
          disabled={disabled || nationalitiesProps.isProtected}
          description={
            isSelf
              ? translate('All your citizenships')
              : translate("All the user's citizenships")
          }
          {...nationalitiesProps}
          renderValue={
            nationalitiesProps.renderValue ||
            ((value) =>
              Array.isArray(value) && value.length > 0 ? (
                <span className="d-flex flex-wrap gap-2">
                  {(value as string[]).map((code) => (
                    <span key={code} className="badge badge-light">
                      <CountryFlag countryCode={code} fontSize={14} /> {code}
                    </span>
                  ))}
                </span>
              ) : null)
          }
        />
      ),
    },
  ];
};

const buildOrganizationFields = ({
  user,
  disabled,
  isSelf,
}: FieldBuilderContext): ProfileField[] => {
  const orgProps = getProtectedFieldProps(
    user,
    'organization',
    isRequired('organization'),
    user.organization,
  );
  const orgCountryProps = getProtectedFieldProps(
    user,
    'organization_country',
    isRequired('organization_country'),
    user.organization_country,
  );
  const orgTypeProps = getProtectedFieldProps(
    user,
    'organization_type',
    isRequired('organization_type'),
    user.organization_type,
  );
  const orgRegistryProps = getProtectedFieldProps(
    user,
    'organization_registry_code',
    isRequired('organization_registry_code'),
    user.organization_registry_code,
  );
  const orgVatProps = getProtectedFieldProps(
    user,
    'organization_vat_code',
    isRequired('organization_vat_code'),
    user.organization_vat_code,
  );
  const orgAddressProps = getProtectedFieldProps(
    user,
    'organization_address',
    isRequired('organization_address'),
    user.organization_address,
  );
  const jobProps = getProtectedFieldProps(
    user,
    'job_title',
    isRequired('job_title'),
    user.job_title,
  );

  return [
    {
      name: 'organization',
      label: translate('Organization name'),
      enabled: true,
      value: user.organization,
      node: (
        <StringEditField
          name="organization"
          label={translate('Organization name')}
          required={isRequired('organization')}
          disabled={disabled || orgProps.isProtected}
          description={
            isSelf
              ? translate(
                  'Specify the name of the organization you are affiliated with',
                )
              : translate(
                  'Specify the name of the organization the user is affiliated with',
                )
          }
          {...orgProps}
        />
      ),
    },
    {
      name: 'organization_country',
      label: translate('Organization country'),
      enabled: isProfileAttributeEnabled('organization_country'),
      value: user.organization_country,
      node: (
        <CountryEditField
          name="organization_country"
          label={translate('Organization country')}
          required={isRequired('organization_country')}
          disabled={disabled || orgCountryProps.isProtected}
          description={
            isSelf
              ? translate("Your organization's country")
              : translate("The user's organization country")
          }
          {...orgCountryProps}
          renderValue={
            orgCountryProps.renderValue ||
            ((value) =>
              value ? (
                <>
                  <CountryFlag countryCode={value} fontSize={14} /> {value}
                </>
              ) : null)
          }
        />
      ),
    },
    {
      name: 'organization_type',
      label: translate('Organization type'),
      enabled: isProfileAttributeEnabled('organization_type'),
      value: user.organization_type,
      node: (
        <SelectEditField
          name="organization_type"
          label={translate('Organization type')}
          options={getOrganizationTypeOptions()}
          simpleValue
          required={isRequired('organization_type')}
          disabled={disabled || orgTypeProps.isProtected}
          description={
            isSelf
              ? translate('The type of organization you belong to')
              : translate('The type of organization the user belongs to')
          }
          {...orgTypeProps}
        />
      ),
    },
    {
      name: 'organization_registry_code',
      label: translate('Organization registry code'),
      enabled: isProfileAttributeEnabled('organization_registry_code'),
      value: user.organization_registry_code,
      node: (
        <StringEditField
          name="organization_registry_code"
          label={translate('Organization registry code')}
          required={isRequired('organization_registry_code')}
          disabled={disabled || orgRegistryProps.isProtected}
          description={
            isSelf
              ? translate("Your organization's registry code")
              : translate("The user's organization registry code")
          }
          {...orgRegistryProps}
        />
      ),
    },
    {
      name: 'organization_vat_code',
      label: translate('Organization VAT code'),
      enabled: isProfileAttributeEnabled('organization_vat_code'),
      value: user.organization_vat_code,
      node: (
        <StringEditField
          name="organization_vat_code"
          label={translate('Organization VAT code')}
          required={isRequired('organization_vat_code')}
          disabled={disabled || orgVatProps.isProtected}
          description={
            isSelf
              ? translate("Your organization's VAT code")
              : translate("The user's organization VAT code")
          }
          {...orgVatProps}
        />
      ),
    },
    {
      name: 'organization_address',
      label: translate('Organization address'),
      enabled: isProfileAttributeEnabled('organization_address'),
      value: user.organization_address,
      node: (
        <StringEditField
          name="organization_address"
          label={translate('Organization address')}
          required={isRequired('organization_address')}
          disabled={disabled || orgAddressProps.isProtected}
          description={
            isSelf
              ? translate("Your organization's postal address")
              : translate("The user's organization address")
          }
          {...orgAddressProps}
        />
      ),
    },
    {
      name: 'job_title',
      label: translate('Job position'),
      enabled: true,
      value: user.job_title,
      node: (
        <StringEditField
          name="job_title"
          label={translate('Job position')}
          required={isRequired('job_title')}
          disabled={disabled || jobProps.isProtected}
          description={
            isSelf
              ? translate(
                  'Describe your role or position within the organization',
                )
              : translate(
                  "Describe the user's role or position within the organization",
                )
          }
          {...jobProps}
        />
      ),
    },
    {
      name: 'affiliations',
      label: translate('Affiliations'),
      enabled: Array.isArray(user.affiliations) && user.affiliations.length > 0,
      value: user.affiliations,
      node: (
        <FormTable.Item
          label={translate('Affiliations')}
          value={(user.affiliations || []).join(', ')}
          disabled={disabled}
        />
      ),
    },
  ];
};

const buildSystemFields = ({
  user,
  currentUser,
  disabled,
}: FieldBuilderContext): ProfileField[] => {
  const isVisibleStaffOrSupport =
    currentUser?.is_staff || currentUser?.is_support;
  const hasEdupersonAssurance =
    isProfileAttributeEnabled('eduperson_assurance') &&
    Array.isArray(user.eduperson_assurance) &&
    user.eduperson_assurance.length > 0;
  const hasSlug = isFeatureVisible(UserFeatures.show_slug);

  return [
    {
      name: 'username',
      label: translate('Username'),
      enabled: true,
      value: user.username,
      node: (
        <FormTable.Item
          label={translate('Username')}
          value={user.username}
          disabled={disabled}
        />
      ),
    },
    {
      name: 'eduperson_assurance',
      label: translate('Assurance levels'),
      enabled: hasEdupersonAssurance,
      value: user.eduperson_assurance,
      node: (
        <FormTable.Item
          label={translate('Assurance levels')}
          value={
            <span className="d-flex flex-wrap gap-2">
              {(Array.isArray(user.eduperson_assurance)
                ? user.eduperson_assurance
                : []
              ).map((uri) => (
                <span key={uri} className="badge badge-light-info">
                  {formatAssuranceUri(uri)}
                </span>
              ))}
            </span>
          }
          disabled={disabled}
        />
      ),
    },
    {
      name: 'date_joined',
      label: translate('Date joined'),
      enabled: true,
      value: user.date_joined,
      node: (
        <FormTable.Item
          label={translate('Date joined')}
          value={formatDateTime(user.date_joined)}
          disabled={disabled}
          description={translate('The date the user has joined')}
        />
      ),
    },
    {
      name: 'user_type',
      label: translate('User type'),
      enabled: Boolean(isVisibleStaffOrSupport),
      node: (
        <FormTable.Item
          label={translate('User type')}
          value={formatUserStatus(user)}
          disabled={disabled}
        />
      ),
    },
    {
      name: 'civil_number',
      label: translate('ID code'),
      enabled: Boolean(user.civil_number),
      value: user.civil_number,
      node: (
        <FormTable.Item
          label={translate('ID code')}
          value={user.civil_number}
          disabled={disabled}
        />
      ),
    },
    {
      name: 'uid_number',
      label: translate('POSIX UID'),
      enabled:
        isProfileAttributeEnabled('uid_number') && user.uid_number != null,
      value: user.uid_number,
      node: (
        <FormTable.Item
          label={translate('POSIX UID')}
          value={String(user.uid_number)}
          disabled={disabled}
          description={translate(
            'POSIX UID supplied by the identity provider; used by offerings whose UID source is the user attribute.',
          )}
        />
      ),
    },
    {
      name: 'primary_gid',
      label: translate('POSIX primary GID'),
      enabled:
        isProfileAttributeEnabled('primary_gid') && user.primary_gid != null,
      value: user.primary_gid,
      node: (
        <FormTable.Item
          label={translate('POSIX primary GID')}
          value={String(user.primary_gid)}
          disabled={disabled}
          description={translate(
            'POSIX primary GID supplied by the identity provider; used by offerings whose primary GID source is the user attribute.',
          )}
        />
      ),
    },
    {
      name: 'slug',
      label: translate('Shortname'),
      enabled: hasSlug,
      value: user.slug,
      node: (
        <StringEditField
          name="slug"
          label={translate('Shortname')}
          disabled={disabled || !currentUser.is_staff}
          isStaffOnly
        />
      ),
    },
  ];
};

const buildStaffFields = ({
  user,
  currentUser,
  disabled,
  isSelf,
}: FieldBuilderContext): ProfileField[] => {
  const isStaffUser = currentUser?.is_staff;

  return [
    {
      name: 'description',
      label: translate('Notes'),
      enabled: true,
      value: user.description,
      node: (
        <TextEditField
          name="description"
          label={translate('Notes')}
          required={isRequired('description')}
          disabled={disabled}
          description={translate('Internal notes about this user account')}
          maxLength={500}
          isStaffOnly
        />
      ),
    },
    {
      name: 'notifications_enabled',
      label: translate('Notifications'),
      enabled: true,
      value: user.notifications_enabled,
      node: (
        <BooleanEditField
          name="notifications_enabled"
          label={translate('Notifications')}
          disabled={disabled || !isStaffUser}
          description={
            isSelf
              ? translate('Enable or disable notifications for your account')
              : translate('Enable or disable notifications for this user')
          }
          isStaffOnly
        />
      ),
    },
  ];
};

type TabKey =
  'basic' | 'personal' | 'geographic' | 'organization' | 'system' | 'staff';

interface UserProfileTabsProps {
  user: User;
  disabled?: boolean;
}

const useProfileTabFields = (
  ctx: FieldBuilderContext,
): Record<TabKey, ProfileField[]> => {
  const { user, currentUser, disabled, isSelf } = ctx;
  return useMemo(
    () => ({
      basic: buildBasicFields(ctx),
      personal: buildPersonalFields(ctx),
      geographic: buildGeographicFields(ctx),
      organization: buildOrganizationFields(ctx),
      system: buildSystemFields(ctx),
      staff: buildStaffFields(ctx),
    }),
    // ctx is rebuilt from these primitives on every render; depend on them.
    [user, currentUser, disabled, isSelf],
  );
};

export const UserProfileTabs = ({
  user,
  disabled = false,
}: UserProfileTabsProps) => {
  const currentUser = useUser();
  const { confirm } = useModal();
  const isSelf = currentUser.uuid === user.uuid;
  const isVisibleStaffOrSupport =
    currentUser?.is_staff || currentUser?.is_support;

  const tabFields = useProfileTabFields({
    user,
    currentUser,
    disabled,
    isSelf,
  });

  const hasPersonalFields = tabFields.personal.some((f) => f.enabled);
  const hasGeographicFields = tabFields.geographic.some((f) => f.enabled);

  const { callback: baseCallback } = useUpdateUser(user);
  const { data: fieldWarnings } = useProfileFieldWarnings();

  const handleUpdate = useCallback(
    async (values) => {
      // Find which field was updated by checking keys
      const updatedKeys = Object.keys(values);
      if (updatedKeys.length > 0) {
        const resolveName = updatedKeys[0];
        const newValue = values[resolveName];
        const isEmpty =
          newValue === '' ||
          newValue === null ||
          newValue === undefined ||
          (Array.isArray(newValue) && newValue.length === 0);

        if (isEmpty && fieldWarnings) {
          const offerings = fieldWarnings[resolveName];
          if (offerings?.length) {
            const offeringNames = offerings
              .map((o) => o.offering_name)
              .join(', ');
            try {
              await confirm(
                translate('Field required by offerings'),
                translate(
                  'This field is required by: {offerings}. Without it, service providers will not be able to see your user account.',
                  {
                    offerings: offeringNames,
                  },
                ),
                {
                  positiveButton: translate('Clear anyway'),
                  positiveButtonVariant: 'warning',
                  negativeButton: translate('Cancel'),
                },
              );
            } catch {
              return;
            }
          }
        }
      }

      await baseCallback(values);
    },
    [baseCallback, fieldWarnings, confirm],
  );

  return (
    <EditFieldProvider scope={user} callback={handleUpdate}>
      <TabbedSection title={translate('Details')} hideActions={disabled}>
        <TabbedSection.Tab
          id="basic"
          title={
            <>
              {translate('Basic info')}
              <TabBadge stats={computeStats(tabFields.basic)} tabKey="basic" />
            </>
          }
        >
          <FieldList fields={tabFields.basic} />
        </TabbedSection.Tab>
        {hasPersonalFields && (
          <TabbedSection.Tab
            id="personal"
            title={
              <>
                {translate('Personal')}
                <TabBadge
                  stats={computeStats(tabFields.personal)}
                  tabKey="personal"
                />
              </>
            }
          >
            <FieldList
              fields={tabFields.personal}
              emptyMessage={translate(
                'No personal identity fields are enabled.',
              )}
            />
          </TabbedSection.Tab>
        )}
        {hasGeographicFields && (
          <TabbedSection.Tab
            id="geographic"
            title={
              <>
                {translate('Geographic')}
                <TabBadge
                  stats={computeStats(tabFields.geographic)}
                  tabKey="geographic"
                />
              </>
            }
          >
            <FieldList
              fields={tabFields.geographic}
              emptyMessage={translate('No geographic fields are enabled.')}
            />
          </TabbedSection.Tab>
        )}
        <TabbedSection.Tab
          id="organization"
          title={
            <>
              {translate('Affiliation')}
              <TabBadge
                stats={computeStats(tabFields.organization)}
                tabKey="organization"
              />
            </>
          }
        >
          <FieldList fields={tabFields.organization} />
        </TabbedSection.Tab>
        <TabbedSection.Tab
          id="system"
          title={
            <>
              {translate('System')}
              <TabBadge
                stats={computeStats(tabFields.system)}
                tabKey="system"
              />
            </>
          }
        >
          <FieldList fields={tabFields.system} />
        </TabbedSection.Tab>
        {isVisibleStaffOrSupport && (
          <TabbedSection.Tab
            id="staff"
            title={
              <>
                <StaffOnlyIndicator className="me-1" />
                {translate('Internal')}
                <TabBadge
                  stats={computeStats(tabFields.staff)}
                  tabKey="staff"
                />
              </>
            }
          >
            <FieldList fields={tabFields.staff} />
          </TabbedSection.Tab>
        )}
      </TabbedSection>
    </EditFieldProvider>
  );
};
