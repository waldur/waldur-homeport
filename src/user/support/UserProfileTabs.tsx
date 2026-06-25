import { useCallback, useMemo } from 'react';
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

interface TabContentProps {
  user: User;
  disabled: boolean;
  isSelf: boolean;
}

const BasicInfoTab = ({ user, disabled, isSelf }: TabContentProps) => {
  const hasNativeName = isProfileAttributeEnabled('native_name');

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

  return (
    <>
      <UserEditAvatarFormItem user={user} disabled={disabled} />
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
      {hasNativeName && (
        <StringEditField
          name="native_name"
          label={translate('Native name')}
          required={isRequired('native_name')}
          disabled={disabled || nativeNameProps.isProtected}
          {...nativeNameProps}
        />
      )}
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
            : translate("Provide an email address for the user's notifications")
        }
        actions={
          !emailProps.isProtected ? (
            <ChangeEmailButton user={user} disabled={disabled} />
          ) : null
        }
      />
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
    </>
  );
};

const PersonalTab = ({ user, disabled, isSelf }: TabContentProps) => {
  const hasPersonalTitle = isProfileAttributeEnabled('personal_title');
  const hasGender = isProfileAttributeEnabled('gender');
  const hasBirthDate = isProfileAttributeEnabled('birth_date');
  const hasPlaceOfBirth = isProfileAttributeEnabled('place_of_birth');

  if (!hasPersonalTitle && !hasGender && !hasBirthDate && !hasPlaceOfBirth) {
    return (
      <div className="text-muted text-center py-6">
        {translate('No personal identity fields are enabled.')}
      </div>
    );
  }

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

  return (
    <>
      {hasPersonalTitle && (
        <SelectEditField
          name="personal_title"
          label={translate('Personal title')}
          options={getPersonalTitleOptions()}
          required={isRequired('personal_title')}
          disabled={disabled || titleProps.isProtected}
          description={
            isSelf
              ? translate('Your honorific title (Mr, Ms, Dr, Prof, etc.)')
              : translate("The user's honorific title")
          }
          {...titleProps}
        />
      )}
      {hasGender && (
        <SelectEditField
          name="gender"
          label={translate('Gender')}
          options={getGenderChoices()}
          required={isRequired('gender')}
          disabled={disabled || genderProps.isProtected}
          description={
            isSelf ? translate('Your gender') : translate("The user's gender")
          }
          {...genderProps}
        />
      )}
      {hasBirthDate && (
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
      )}
      {hasPlaceOfBirth && (
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
      )}
    </>
  );
};

const GeographicTab = ({ user, disabled, isSelf }: TabContentProps) => {
  const hasCountryOfResidence = isProfileAttributeEnabled(
    'country_of_residence',
  );
  const hasNationality = isProfileAttributeEnabled('nationality');
  const hasNationalities = isProfileAttributeEnabled('nationalities');

  if (!hasCountryOfResidence && !hasNationality && !hasNationalities) {
    return (
      <div className="text-muted text-center py-6">
        {translate('No geographic fields are enabled.')}
      </div>
    );
  }

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

  return (
    <>
      {hasCountryOfResidence && (
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
      )}
      {hasNationality && (
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
      )}
      {hasNationalities && (
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
      )}
    </>
  );
};

const OrganizationTab = ({ user, disabled, isSelf }: TabContentProps) => {
  const hasOrganizationCountry = isProfileAttributeEnabled(
    'organization_country',
  );
  const hasOrganizationType = isProfileAttributeEnabled('organization_type');
  const hasOrganizationRegistryCode = isProfileAttributeEnabled(
    'organization_registry_code',
  );
  const hasOrganizationVatCode = isProfileAttributeEnabled(
    'organization_vat_code',
  );
  const hasAffiliations =
    Array.isArray(user.affiliations) && user.affiliations.length > 0;

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
  const jobProps = getProtectedFieldProps(
    user,
    'job_title',
    isRequired('job_title'),
    user.job_title,
  );

  return (
    <>
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
      {hasOrganizationCountry && (
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
      )}
      {hasOrganizationType && (
        <SelectEditField
          name="organization_type"
          label={translate('Organization type')}
          options={getOrganizationTypeOptions()}
          required={isRequired('organization_type')}
          disabled={disabled || orgTypeProps.isProtected}
          description={
            isSelf
              ? translate('The type of organization you belong to')
              : translate('The type of organization the user belongs to')
          }
          {...orgTypeProps}
        />
      )}
      {hasOrganizationRegistryCode && (
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
      )}
      {hasOrganizationVatCode && (
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
      )}
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
      {hasAffiliations && (
        <FormTable.Item
          label={translate('Affiliations')}
          value={user.affiliations.join(', ')}
          disabled={disabled}
        />
      )}
    </>
  );
};

const SystemTab = ({ user, disabled }: TabContentProps) => {
  const currentUser = useUser();
  const isVisibleStaffOrSupport =
    currentUser?.is_staff || currentUser?.is_support;
  const hasEdupersonAssurance =
    isProfileAttributeEnabled('eduperson_assurance') &&
    Array.isArray(user.eduperson_assurance) &&
    user.eduperson_assurance.length > 0;
  const hasSlug = isFeatureVisible(UserFeatures.show_slug);

  return (
    <>
      <FormTable.Item
        label={translate('Username')}
        value={user.username}
        disabled={disabled}
      />
      {hasEdupersonAssurance && (
        <FormTable.Item
          label={translate('Assurance levels')}
          value={
            <span className="d-flex flex-wrap gap-2">
              {(user.eduperson_assurance as string[]).map((uri) => (
                <span key={uri} className="badge badge-light-info">
                  {formatAssuranceUri(uri)}
                </span>
              ))}
            </span>
          }
          disabled={disabled}
        />
      )}
      <FormTable.Item
        label={translate('Date joined')}
        value={formatDateTime(user.date_joined)}
        disabled={disabled}
        description={translate('The date the user has joined')}
      />
      {isVisibleStaffOrSupport && (
        <FormTable.Item
          label={translate('User type')}
          value={formatUserStatus(user)}
          disabled={disabled}
        />
      )}
      {user.civil_number && (
        <FormTable.Item
          label={translate('ID code')}
          value={user.civil_number}
          disabled={disabled}
        />
      )}
      {hasSlug && (
        <StringEditField
          name="slug"
          label={translate('Shortname')}
          disabled={disabled || !currentUser.is_staff}
          isStaffOnly
        />
      )}
    </>
  );
};

const StaffTab = ({ disabled, isSelf }: TabContentProps) => {
  const currentUser = useUser();
  const isStaffUser = currentUser?.is_staff;

  return (
    <>
      <TextEditField
        name="description"
        label={translate('Notes')}
        required={isRequired('description')}
        disabled={disabled}
        description={translate('Internal notes about this user account')}
        maxLength={500}
        isStaffOnly
      />
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
    </>
  );
};

type TabKey =
  | 'basic'
  | 'personal'
  | 'geographic'
  | 'organization'
  | 'system'
  | 'staff';

interface UserProfileTabsProps {
  user: User;
  disabled?: boolean;
}

const useTabStats = (user: User): Record<TabKey, TabStats> => {
  return useMemo(() => {
    const calculateStats = (
      fields: Array<{
        name: string;
        enabled: boolean;
        value: unknown;
        label: string;
      }>,
    ): TabStats => {
      const enabledFields = fields.filter((f) => f.enabled);
      const missingMandatory = enabledFields.filter(
        (f) => isRequired(f.name) && !hasValue(f.value),
      );
      return {
        total: enabledFields.length,
        missingMandatory: missingMandatory.length,
        missingMandatoryFields: missingMandatory.map((f) => f.label),
      };
    };

    const basicFields = [
      {
        name: 'first_name',
        enabled: true,
        value: user.first_name,
        label: translate('First name'),
      },
      {
        name: 'last_name',
        enabled: true,
        value: user.last_name,
        label: translate('Last name'),
      },
      {
        name: 'native_name',
        enabled: isProfileAttributeEnabled('native_name'),
        value: user.native_name,
        label: translate('Native name'),
      },
      {
        name: 'email',
        enabled: true,
        value: user.email,
        label: translate('Email'),
      },
      {
        name: 'phone_number',
        enabled: true,
        value: user.phone_number,
        label: translate('Phone number'),
      },
    ];

    const personalFields = [
      {
        name: 'personal_title',
        enabled: isProfileAttributeEnabled('personal_title'),
        value: user.personal_title,
        label: translate('Personal title'),
      },
      {
        name: 'gender',
        enabled: isProfileAttributeEnabled('gender'),
        value: user.gender,
        label: translate('Gender'),
      },
      {
        name: 'birth_date',
        enabled: isProfileAttributeEnabled('birth_date'),
        value: user.birth_date,
        label: translate('Birth date'),
      },
      {
        name: 'place_of_birth',
        enabled: isProfileAttributeEnabled('place_of_birth'),
        value: user.place_of_birth,
        label: translate('Place of birth'),
      },
    ];

    const geographicFields = [
      {
        name: 'country_of_residence',
        enabled: isProfileAttributeEnabled('country_of_residence'),
        value: user.country_of_residence,
        label: translate('Country of residence'),
      },
      {
        name: 'nationality',
        enabled: isProfileAttributeEnabled('nationality'),
        value: user.nationality,
        label: translate('Nationality'),
      },
      {
        name: 'nationalities',
        enabled: isProfileAttributeEnabled('nationalities'),
        value: user.nationalities,
        label: translate('Nationalities'),
      },
    ];

    const organizationFields = [
      {
        name: 'organization',
        enabled: true,
        value: user.organization,
        label: translate('Organization'),
      },
      {
        name: 'organization_country',
        enabled: isProfileAttributeEnabled('organization_country'),
        value: user.organization_country,
        label: translate('Organization country'),
      },
      {
        name: 'organization_type',
        enabled: isProfileAttributeEnabled('organization_type'),
        value: user.organization_type,
        label: translate('Organization type'),
      },
      {
        name: 'organization_registry_code',
        enabled: isProfileAttributeEnabled('organization_registry_code'),
        value: user.organization_registry_code,
        label: translate('Organization registry code'),
      },
      {
        name: 'job_title',
        enabled: true,
        value: user.job_title,
        label: translate('Job position'),
      },
    ];

    // System tab has no mandatory editable fields
    const systemFields = [
      {
        name: 'username',
        enabled: true,
        value: user.username,
        label: translate('Username'),
      },
      {
        name: 'date_joined',
        enabled: true,
        value: user.date_joined,
        label: '',
      },
    ];

    // Staff tab
    const staffFields = [
      {
        name: 'description',
        enabled: true,
        value: user.description,
        label: translate('Notes'),
      },
    ];

    return {
      basic: calculateStats(basicFields),
      personal: calculateStats(personalFields),
      geographic: calculateStats(geographicFields),
      organization: calculateStats(organizationFields),
      system: calculateStats(systemFields),
      staff: calculateStats(staffFields),
    };
  }, [user]);
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

  const tabStats = useTabStats(user);

  // Determine which tabs to show based on enabled profile attributes
  const hasPersonalFields =
    isProfileAttributeEnabled('personal_title') ||
    isProfileAttributeEnabled('gender') ||
    isProfileAttributeEnabled('birth_date') ||
    isProfileAttributeEnabled('place_of_birth');

  const hasGeographicFields =
    isProfileAttributeEnabled('country_of_residence') ||
    isProfileAttributeEnabled('nationality') ||
    isProfileAttributeEnabled('nationalities');

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
              <TabBadge stats={tabStats.basic} tabKey="basic" />
            </>
          }
        >
          <BasicInfoTab user={user} disabled={disabled} isSelf={isSelf} />
        </TabbedSection.Tab>
        {hasPersonalFields && (
          <TabbedSection.Tab
            id="personal"
            title={
              <>
                {translate('Personal')}
                <TabBadge stats={tabStats.personal} tabKey="personal" />
              </>
            }
          >
            <PersonalTab user={user} disabled={disabled} isSelf={isSelf} />
          </TabbedSection.Tab>
        )}
        {hasGeographicFields && (
          <TabbedSection.Tab
            id="geographic"
            title={
              <>
                {translate('Geographic')}
                <TabBadge stats={tabStats.geographic} tabKey="geographic" />
              </>
            }
          >
            <GeographicTab user={user} disabled={disabled} isSelf={isSelf} />
          </TabbedSection.Tab>
        )}
        <TabbedSection.Tab
          id="organization"
          title={
            <>
              {translate('Affiliation')}
              <TabBadge stats={tabStats.organization} tabKey="organization" />
            </>
          }
        >
          <OrganizationTab user={user} disabled={disabled} isSelf={isSelf} />
        </TabbedSection.Tab>
        <TabbedSection.Tab
          id="system"
          title={
            <>
              {translate('System')}
              <TabBadge stats={tabStats.system} tabKey="system" />
            </>
          }
        >
          <SystemTab user={user} disabled={disabled} isSelf={isSelf} />
        </TabbedSection.Tab>
        {isVisibleStaffOrSupport && (
          <TabbedSection.Tab
            id="staff"
            title={
              <>
                <StaffOnlyIndicator className="me-1" />
                {translate('Internal')}
                <TabBadge stats={tabStats.staff} tabKey="staff" />
              </>
            }
          >
            <StaffTab user={user} disabled={disabled} isSelf={isSelf} />
          </TabbedSection.Tab>
        )}
      </TabbedSection>
    </EditFieldProvider>
  );
};
