import { useCurrentStateAndParams } from '@uirouter/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { User } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { StaffOnlyIndicator } from '@waldur/customer/details/StaffOnlyIndicator';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { CountryFlag } from '@waldur/marketplace/common/CountryFlag';
import { formatUserStatus } from '@waldur/user/support/utils';
import {
  getUser,
  isStaffOrSupport,
  isStaff,
} from '@waldur/workspace/selectors';

import {
  formatGender,
  formatOrganizationType,
  formatAssuranceUri,
} from './aai-constants';
import { ChangeEmailButton } from './ChangeEmailButton';
import { isProfileAttributeEnabled } from './profileAttributes';
import { UserEditAvatarFormItem } from './UserEditAvatarFormItem';
import { UserEditRow } from './UserEditRow';

const isRequired = (field: string) => {
  return (
    ENV.plugins.WALDUR_CORE.USER_MANDATORY_FIELDS.includes(field) ||
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
        <span className="badge badge-sm badge-circle badge-danger ms-2">
          {stats.missingMandatory}
        </span>
      </Tip>
    );
  }
  return (
    <span className="badge badge-sm badge-circle badge-light ms-2">
      {stats.total}
    </span>
  );
};

const fieldIsProtected = (user: User, field: string) =>
  user.identity_provider_fields.includes(field) ||
  (
    ENV.plugins.WALDUR_CORE.PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS || []
  ).includes(user.registration_method);

interface TabContentProps {
  user: User;
  disabled: boolean;
  isSelf: boolean;
}

// Basic Information Tab
const BasicInfoTab = ({ user, disabled, isSelf }: TabContentProps) => {
  const hasNativeName = isProfileAttributeEnabled('native_name');

  return (
    <FormTable>
      <UserEditAvatarFormItem user={user} disabled={disabled} />
      <UserEditRow
        user={user}
        label={translate('First name')}
        name="first_name"
        value={user.first_name}
        disabled={disabled}
        description={
          isSelf
            ? translate('Display your first name on your profile')
            : translate("Display the user's first name on their profile")
        }
        required={isRequired('first_name')}
        protected={fieldIsProtected(user, 'first_name')}
      />
      <UserEditRow
        user={user}
        label={translate('Last name')}
        name="last_name"
        value={user.last_name}
        disabled={disabled}
        description={
          isSelf
            ? translate('Display your last name on your profile')
            : translate("Display the user's last name on their profile")
        }
        required={isRequired('last_name')}
        protected={fieldIsProtected(user, 'last_name')}
      />
      {hasNativeName && (
        <UserEditRow
          user={user}
          label={translate('Native name')}
          name="native_name"
          value={user.native_name}
          disabled={disabled}
          required={isRequired('native_name')}
          protected={fieldIsProtected(user, 'native_name')}
        />
      )}
      <UserEditRow
        user={user}
        label={translate('Email')}
        name="email"
        value={user.email}
        disabled={disabled}
        protected={fieldIsProtected(user, 'email')}
        required={isRequired('email')}
        description={
          isSelf
            ? translate('Provide an email address for notifications')
            : translate("Provide an email address for the user's notifications")
        }
        actions={
          !fieldIsProtected(user, 'email') ? (
            <ChangeEmailButton user={user} disabled={disabled} />
          ) : null
        }
      />
      <UserEditRow
        user={user}
        label={translate('Phone number')}
        name="phone_number"
        value={user.phone_number}
        disabled={disabled}
        protected={fieldIsProtected(user, 'phone_number')}
        required={isRequired('phone_number')}
        description={translate(
          'International format with country code, e.g. +1 202 555 1234',
        )}
      />
    </FormTable>
  );
};

// Personal Identity Tab
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

  return (
    <FormTable>
      {hasPersonalTitle && (
        <UserEditRow
          user={user}
          label={translate('Personal title')}
          name="personal_title"
          value={user.personal_title}
          disabled={disabled}
          required={isRequired('personal_title')}
          protected={fieldIsProtected(user, 'personal_title')}
          description={
            isSelf
              ? translate('Your honorific title (Mr, Ms, Dr, Prof, etc.)')
              : translate("The user's honorific title")
          }
        />
      )}
      {hasGender && (
        <UserEditRow
          user={user}
          label={translate('Gender')}
          name="gender"
          value={formatGender(user.gender)}
          disabled={disabled}
          required={isRequired('gender')}
          protected={fieldIsProtected(user, 'gender')}
          description={
            isSelf ? translate('Your gender') : translate("The user's gender")
          }
        />
      )}
      {hasBirthDate && (
        <UserEditRow
          user={user}
          label={translate('Birth date')}
          name="birth_date"
          value={user.birth_date ? formatDate(user.birth_date) : null}
          disabled={disabled}
          required={isRequired('birth_date')}
          protected={fieldIsProtected(user, 'birth_date')}
          description={
            isSelf
              ? translate('Your date of birth')
              : translate("The user's date of birth")
          }
        />
      )}
      {hasPlaceOfBirth && (
        <UserEditRow
          user={user}
          label={translate('Place of birth')}
          name="place_of_birth"
          value={user.place_of_birth}
          disabled={disabled}
          required={isRequired('place_of_birth')}
          protected={fieldIsProtected(user, 'place_of_birth')}
          description={
            isSelf
              ? translate('Your place of birth')
              : translate("The user's place of birth")
          }
        />
      )}
    </FormTable>
  );
};

// Geographic Tab
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

  return (
    <FormTable>
      {hasCountryOfResidence && (
        <UserEditRow
          user={user}
          label={translate('Country of residence')}
          name="country_of_residence"
          value={
            user.country_of_residence ? (
              <span>
                <CountryFlag
                  countryCode={user.country_of_residence}
                  fontSize={16}
                />{' '}
                {user.country_of_residence}
              </span>
            ) : null
          }
          disabled={disabled}
          required={isRequired('country_of_residence')}
          protected={fieldIsProtected(user, 'country_of_residence')}
          description={
            isSelf
              ? translate('Your current country of residence')
              : translate("The user's current country of residence")
          }
        />
      )}
      {hasNationality && (
        <UserEditRow
          user={user}
          label={translate('Nationality')}
          name="nationality"
          value={
            user.nationality ? (
              <span>
                <CountryFlag countryCode={user.nationality} fontSize={16} />{' '}
                {user.nationality}
              </span>
            ) : null
          }
          disabled={disabled}
          required={isRequired('nationality')}
          protected={fieldIsProtected(user, 'nationality')}
          description={
            isSelf
              ? translate('Your primary nationality')
              : translate("The user's primary nationality")
          }
        />
      )}
      {hasNationalities && (
        <UserEditRow
          user={user}
          label={translate('Nationalities')}
          name="nationalities"
          value={
            Array.isArray(user.nationalities) &&
            user.nationalities.length > 0 ? (
              <span className="d-flex flex-wrap gap-2">
                {(user.nationalities as string[]).map((code) => (
                  <span key={code} className="badge badge-light">
                    <CountryFlag countryCode={code} fontSize={14} /> {code}
                  </span>
                ))}
              </span>
            ) : null
          }
          disabled={disabled}
          required={isRequired('nationalities')}
          protected={fieldIsProtected(user, 'nationalities')}
          description={
            isSelf
              ? translate('All your citizenships')
              : translate("All the user's citizenships")
          }
        />
      )}
    </FormTable>
  );
};

// Organization Tab
const OrganizationTab = ({ user, disabled, isSelf }: TabContentProps) => {
  const hasOrganizationCountry = isProfileAttributeEnabled(
    'organization_country',
  );
  const hasOrganizationType = isProfileAttributeEnabled('organization_type');
  const hasOrganizationRegistryCode = isProfileAttributeEnabled(
    'organization_registry_code',
  );
  const hasAffiliations =
    Array.isArray(user.affiliations) && user.affiliations.length > 0;

  return (
    <FormTable>
      <UserEditRow
        user={user}
        label={translate('Organization name')}
        name="organization"
        value={user.organization}
        disabled={disabled}
        required={isRequired('organization')}
        protected={fieldIsProtected(user, 'organization')}
        description={
          isSelf
            ? translate(
                'Specify the name of the organization you are affiliated with',
              )
            : translate(
                'Specify the name of the organization the user is affiliated with',
              )
        }
      />
      {hasOrganizationCountry && (
        <UserEditRow
          user={user}
          label={translate('Organization country')}
          name="organization_country"
          value={
            user.organization_country ? (
              <span>
                <CountryFlag
                  countryCode={user.organization_country}
                  fontSize={16}
                />{' '}
                {user.organization_country}
              </span>
            ) : null
          }
          disabled={disabled}
          required={isRequired('organization_country')}
          protected={fieldIsProtected(user, 'organization_country')}
          description={
            isSelf
              ? translate("Your organization's country")
              : translate("The user's organization country")
          }
        />
      )}
      {hasOrganizationType && (
        <UserEditRow
          user={user}
          label={translate('Organization type')}
          name="organization_type"
          value={formatOrganizationType(user.organization_type)}
          disabled={disabled}
          required={isRequired('organization_type')}
          protected={fieldIsProtected(user, 'organization_type')}
          description={
            isSelf
              ? translate('The type of organization you belong to')
              : translate('The type of organization the user belongs to')
          }
        />
      )}
      {hasOrganizationRegistryCode && (
        <UserEditRow
          user={user}
          label={translate('Organization registry code')}
          name="organization_registry_code"
          value={user.organization_registry_code}
          disabled={disabled}
          required={isRequired('organization_registry_code')}
          protected={fieldIsProtected(user, 'organization_registry_code')}
          description={
            isSelf
              ? translate("Your organization's registry code")
              : translate("The user's organization registry code")
          }
        />
      )}
      <UserEditRow
        user={user}
        label={translate('Job position')}
        name="job_title"
        value={user.job_title}
        disabled={disabled}
        required={isRequired('job_title')}
        protected={fieldIsProtected(user, 'job_title')}
        description={
          isSelf
            ? translate(
                'Describe your role or position within the organization',
              )
            : translate(
                "Describe the user's role or position within the organization",
              )
        }
      />
      {hasAffiliations && (
        <UserEditRow
          user={user}
          label={translate('Affiliations')}
          name="affiliations"
          value={user.affiliations.join(', ')}
          disabled={disabled}
          protected={true}
        />
      )}
    </FormTable>
  );
};

// System Tab
const SystemTab = ({ user, disabled }: TabContentProps) => {
  const isVisibleStaffOrSupport = useSelector(isStaffOrSupport);
  const currentUser = useSelector(getUser);
  const hasEdupersonAssurance =
    isProfileAttributeEnabled('eduperson_assurance') &&
    Array.isArray(user.eduperson_assurance) &&
    user.eduperson_assurance.length > 0;
  const hasSlug = isFeatureVisible(UserFeatures.show_slug);

  return (
    <FormTable>
      <UserEditRow
        user={user}
        label={translate('Username')}
        name="username"
        value={user.username}
        disabled={disabled}
        protected={true}
        protectedMsg={translate('Read-only field')}
      />
      {hasEdupersonAssurance && (
        <UserEditRow
          user={user}
          label={translate('Assurance levels')}
          name="eduperson_assurance"
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
          protected={true}
          protectedMsg={translate('Read-only field from identity provider')}
        />
      )}
      <UserEditRow
        user={user}
        label={translate('Date joined')}
        name="date_joined"
        value={formatDateTime(user.date_joined)}
        disabled={disabled}
        protected={true}
        protectedMsg={translate('Read-only field')}
        description={translate('The date the user has joined')}
      />
      {isVisibleStaffOrSupport && (
        <UserEditRow
          user={user}
          label={translate('User type')}
          name="type"
          value={formatUserStatus(user)}
          disabled={disabled}
          protected={true}
          protectedMsg={translate('Read-only field')}
        />
      )}
      {user.civil_number && (
        <UserEditRow
          user={user}
          label={translate('ID code')}
          name="civil_number"
          value={user.civil_number}
          disabled={disabled}
          protected={true}
        />
      )}
      {hasSlug && (
        <UserEditRow
          user={user}
          label={translate('Shortname')}
          name="slug"
          value={user.slug}
          disabled={disabled}
          protected={!currentUser.is_staff}
        />
      )}
    </FormTable>
  );
};

// Internal Tab (visible only to staff and support)
const StaffTab = ({ user, disabled, isSelf }: TabContentProps) => {
  const isStaffUser = useSelector(isStaff);

  return (
    <FormTable>
      <UserEditRow
        user={user}
        label={translate('Notes')}
        name="description"
        value={user.description}
        disabled={disabled}
        description={translate('Internal notes about this user account')}
        required={isRequired('description')}
      />
      <UserEditRow
        user={user}
        label={translate('Notifications')}
        name="notifications_enabled"
        value={
          user.notifications_enabled
            ? translate('Enabled')
            : translate('Disabled')
        }
        disabled={disabled || !isStaffUser}
        description={
          isSelf
            ? translate('Enable or disable notifications for your account')
            : translate('Enable or disable notifications for this user')
        }
      />
    </FormTable>
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

const TAB_KEYS: TabKey[] = [
  'basic',
  'personal',
  'geographic',
  'organization',
  'system',
  'staff',
];

export const UserProfileTabs = ({
  user,
  disabled = false,
}: UserProfileTabsProps) => {
  const { params } = useCurrentStateAndParams();
  const currentUser = useSelector(getUser);
  const isSelf = currentUser.uuid === user.uuid;
  const isVisibleStaffOrSupport = useSelector(isStaffOrSupport);

  // Initialize tab from URL param or default to 'basic'
  const initialTab =
    params.section && TAB_KEYS.includes(params.section as TabKey)
      ? (params.section as TabKey)
      : 'basic';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Update URL when tab changes (using History API to avoid full reload)
  const handleTabChange = useCallback((key: TabKey) => {
    setActiveTab(key);
    // Update URL without triggering UI-Router state transition
    const url = new URL(window.location.href);
    url.searchParams.set('section', key);
    window.history.replaceState(null, '', url.toString());
  }, []);

  // Sync with URL changes (e.g., browser back/forward)
  useEffect(() => {
    if (params.section && TAB_KEYS.includes(params.section as TabKey)) {
      setActiveTab(params.section as TabKey);
    }
  }, [params.section]);

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

  const tabs: { key: TabKey; title: React.ReactNode; show: boolean }[] = [
    {
      key: 'basic',
      title: (
        <>
          {translate('Basic info')}
          <TabBadge stats={tabStats.basic} tabKey="basic" />
        </>
      ),
      show: true,
    },
    {
      key: 'personal',
      title: (
        <>
          {translate('Personal')}
          <TabBadge stats={tabStats.personal} tabKey="personal" />
        </>
      ),
      show: hasPersonalFields,
    },
    {
      key: 'geographic',
      title: (
        <>
          {translate('Geographic')}
          <TabBadge stats={tabStats.geographic} tabKey="geographic" />
        </>
      ),
      show: hasGeographicFields,
    },
    {
      key: 'organization',
      title: (
        <>
          {translate('Affiliation')}
          <TabBadge stats={tabStats.organization} tabKey="organization" />
        </>
      ),
      show: true,
    },
    {
      key: 'system',
      title: (
        <>
          {translate('System')}
          <TabBadge stats={tabStats.system} tabKey="system" />
        </>
      ),
      show: true,
    },
    {
      key: 'staff',
      title: (
        <>
          <StaffOnlyIndicator className="me-1" />
          {translate('Internal')}
          <TabBadge stats={tabStats.staff} tabKey="staff" />
        </>
      ),
      show: isVisibleStaffOrSupport,
    },
  ];

  const visibleTabs = tabs.filter((tab) => tab.show);

  const tabContent: Record<TabKey, React.ReactNode> = {
    basic: <BasicInfoTab user={user} disabled={disabled} isSelf={isSelf} />,
    personal: <PersonalTab user={user} disabled={disabled} isSelf={isSelf} />,
    geographic: (
      <GeographicTab user={user} disabled={disabled} isSelf={isSelf} />
    ),
    organization: (
      <OrganizationTab user={user} disabled={disabled} isSelf={isSelf} />
    ),
    system: <SystemTab user={user} disabled={disabled} isSelf={isSelf} />,
    staff: <StaffTab user={user} disabled={disabled} isSelf={isSelf} />,
  };

  return (
    <Tab.Container
      activeKey={activeTab}
      onSelect={(k) => handleTabChange(k as TabKey)}
    >
      <Nav variant="tabs" className="nav-line-tabs mb-4">
        {visibleTabs.map((tab) => (
          <Nav.Item key={tab.key}>
            <Nav.Link eventKey={tab.key} className="cursor-pointer">
              {tab.title}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
      <Tab.Content>
        {visibleTabs.map((tab) => (
          <Tab.Pane key={tab.key} eventKey={tab.key}>
            {tabContent[tab.key]}
          </Tab.Pane>
        ))}
      </Tab.Content>
    </Tab.Container>
  );
};
