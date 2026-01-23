import { useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { User } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { formatDateTime } from '@waldur/core/dateUtils';
import { StaffOnlyIndicator } from '@waldur/customer/details/StaffOnlyIndicator';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { CountryFlag } from '@waldur/marketplace/common/CountryFlag';
import { getNativeNameVisible } from '@waldur/store/config';
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
  return ENV.plugins.WALDUR_CORE.USER_MANDATORY_FIELDS.includes(field);
};

const getDefaultRequiredMsg = (field: string, isSelf: boolean) =>
  isSelf
    ? translate('Your {field} is required', { field })
    : translate("The user's {field} is required", { field });

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
  const nativeNameIsVisible = useSelector(getNativeNameVisible);

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
        requiredMsg={
          isRequired('first_name')
            ? getDefaultRequiredMsg(translate('first name'), isSelf)
            : null
        }
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
        requiredMsg={
          isRequired('last_name')
            ? getDefaultRequiredMsg(translate('last name'), isSelf)
            : null
        }
        protected={fieldIsProtected(user, 'last_name')}
      />
      {nativeNameIsVisible && (
        <UserEditRow
          user={user}
          label={translate('Native name')}
          name="native_name"
          value={user.native_name}
          disabled={disabled}
          requiredMsg={
            isRequired('native_name')
              ? getDefaultRequiredMsg(translate('native name'), isSelf)
              : null
          }
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
        requiredMsg={
          isRequired('email')
            ? translate(
                '{pronoun} email is required for account notifications and password recovery',
                { pronoun: isSelf ? translate('Your') : translate("User's") },
              )
            : null
        }
        description={
          isSelf
            ? translate(
                'Provide an email address for communication and recovery',
              )
            : translate(
                "Provide an email address for the user's communication and recovery",
              )
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
        requiredMsg={
          isRequired('phone_number')
            ? translate('{pronoun} phone number', {
                pronoun: isSelf ? translate('Your') : translate("User's"),
              })
            : null
        }
        description={
          isSelf
            ? translate('Enter your contact number')
            : translate('Enter a contact number for the user')
        }
      />
    </FormTable>
  );
};

// Personal Identity Tab
const PersonalTab = ({ user, disabled, isSelf }: TabContentProps) => {
  const hasPersonalTitle = isProfileAttributeEnabled('personal_title');
  const hasGender = isProfileAttributeEnabled('gender');
  const hasPlaceOfBirth = isProfileAttributeEnabled('place_of_birth');

  if (!hasPersonalTitle && !hasGender && !hasPlaceOfBirth) {
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
          value={formatGender(user.gender as number | null | undefined)}
          disabled={disabled}
          protected={fieldIsProtected(user, 'gender')}
          description={
            isSelf
              ? translate('Your gender (ISO 5218)')
              : translate("The user's gender")
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
          protected={fieldIsProtected(user, 'organization_type')}
          description={
            isSelf
              ? translate('The type of organization you belong to')
              : translate('The type of organization the user belongs to')
          }
        />
      )}
      <UserEditRow
        user={user}
        label={translate('Job position')}
        name="job_title"
        value={user.job_title}
        disabled={disabled}
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
const SystemTab = ({ user, disabled, isSelf }: TabContentProps) => {
  const isVisibleStaffOrSupport = useSelector(isStaffOrSupport);
  const currentUser = useSelector(getUser);
  const hasEdupersonAssurance =
    isProfileAttributeEnabled('eduperson_assurance') &&
    Array.isArray(user.eduperson_assurance) &&
    user.eduperson_assurance.length > 0;
  const hasSlug = isFeatureVisible(UserFeatures.show_slug);

  return (
    <FormTable>
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
          description={
            isSelf
              ? translate('Describe your user account type')
              : translate("Describe user's account type")
          }
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
        requiredMsg={
          isRequired('description')
            ? getDefaultRequiredMsg(translate('notes'), isSelf)
            : null
        }
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

export const UserProfileTabs = ({
  user,
  disabled = false,
}: UserProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const currentUser = useSelector(getUser);
  const isSelf = currentUser.uuid === user.uuid;
  const isVisibleStaffOrSupport = useSelector(isStaffOrSupport);

  // Determine which tabs to show based on enabled profile attributes
  const hasPersonalFields =
    isProfileAttributeEnabled('personal_title') ||
    isProfileAttributeEnabled('gender') ||
    isProfileAttributeEnabled('place_of_birth');

  const hasGeographicFields =
    isProfileAttributeEnabled('country_of_residence') ||
    isProfileAttributeEnabled('nationality') ||
    isProfileAttributeEnabled('nationalities');

  const tabs: { key: TabKey; title: React.ReactNode; show: boolean }[] = [
    { key: 'basic', title: translate('Basic info'), show: true },
    { key: 'personal', title: translate('Personal'), show: hasPersonalFields },
    {
      key: 'geographic',
      title: translate('Geographic'),
      show: hasGeographicFields,
    },
    { key: 'organization', title: translate('Affiliation'), show: true },
    { key: 'system', title: translate('System'), show: true },
    {
      key: 'staff',
      title: (
        <>
          <StaffOnlyIndicator className="me-1" />
          {translate('Internal')}
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
      onSelect={(k) => setActiveTab(k as TabKey)}
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
