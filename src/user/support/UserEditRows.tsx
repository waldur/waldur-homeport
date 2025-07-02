import { useSelector } from 'react-redux';
import { User } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getNativeNameVisible } from '@waldur/store/config';
import { formatUserStatus } from '@waldur/user/support/utils';
import {
  getUser,
  isStaffOrSupport,
  isStaff,
} from '@waldur/workspace/selectors';

import { ChangeEmailButton } from './ChangeEmailButton';
import { UserEditRow } from './UserEditRow';

const isRequired = (field: string) => {
  return ENV.plugins.WALDUR_CORE.USER_MANDATORY_FIELDS.includes(field);
};

const getDefaultRequiredMsg = (field, isSelf) =>
  isSelf
    ? translate('Your {field} is required', { field })
    : translate("The user's {field} is required", { field });

const fieldIsProtected = (user: User, field: string) =>
  user.identity_provider_fields.includes(field) ||
  (
    ENV.plugins.WALDUR_CORE.PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS || []
  ).includes(user.registration_method);

const FirstNameRow = ({ user, disabled, isSelf }) => (
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
);

const LastNameRow = ({ user, disabled, isSelf }) => (
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
);

const NativeNameRow = ({ user, disabled, isSelf }) => {
  const nativeNameIsVisible = useSelector(getNativeNameVisible);
  return nativeNameIsVisible ? (
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
  ) : null;
};

const NotificationsEnabledRow = ({ user, disabled, isSelf }) => {
  const isStaffUser = useSelector(isStaff);
  return (
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
          ? translate(
              'Enable or disable notifications for your account (Staff only)',
            )
          : translate(
              'Enable or disable notifications for this user (Staff only)',
            )
      }
    />
  );
};

const PhoneNumberRow = ({ user, disabled, isSelf }) => (
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
);

const EmailRow = ({ user, disabled, isSelf }) => (
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
        ? translate('Provide an email address for communication and recovery')
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
);

const DateJoinedRow = ({ user, disabled }) => (
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
);

const UserTypeRow = ({ user, disabled, isSelf }) => {
  const visible = useSelector(isStaffOrSupport);
  return visible ? (
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
  ) : null;
};

const CivilNumberRow = ({ user, disabled }) =>
  user.civil_number ? (
    <UserEditRow
      user={user}
      label={translate('ID code')}
      name="civil_number"
      value={user.civil_number}
      disabled={disabled}
      protected={true}
    />
  ) : null;

const OrganizationRow = ({ user, disabled, isSelf }) => (
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
);

const JobTitleRow = ({ user, disabled, isSelf }) => (
  <UserEditRow
    user={user}
    label={translate('Job position')}
    name="job_title"
    value={user.job_title}
    disabled={disabled}
    protected={fieldIsProtected(user, 'job_title')}
    description={
      isSelf
        ? translate('Describe your role or position within the organization')
        : translate(
            "Describe the user's role or position within the organization",
          )
    }
  />
);

const AffiliationsRow = ({ user, disabled }) =>
  Array.isArray(user.affiliations) && user.affiliations.length > 0 ? (
    <UserEditRow
      user={user}
      label={translate('Affiliations')}
      name="affiliations"
      value={user.affiliations.join(', ')}
      disabled={disabled}
      protected={true}
    />
  ) : null;

const DescriptionRow = ({ user, disabled, isSelf }) => {
  const visible = useSelector(isStaffOrSupport);
  return visible ? (
    <UserEditRow
      user={user}
      label={translate('Description')}
      name="description"
      value={user.description}
      disabled={disabled}
      description={translate(
        'Additional account description invisible to user',
      )}
      requiredMsg={
        isRequired('description')
          ? getDefaultRequiredMsg(translate('description'), isSelf)
          : null
      }
    />
  ) : null;
};

const ShortnameRow = ({ user, disabled, currentUser }) =>
  isFeatureVisible(UserFeatures.show_slug) ? (
    <UserEditRow
      user={user}
      label={translate('Shortname')}
      name="slug"
      value={user.slug}
      disabled={disabled}
      protected={!currentUser.is_staff}
    />
  ) : null;

export const UserEditRows = ({
  user,
  disabled,
}: {
  user: User;
  disabled?: boolean;
}) => {
  const currentUser = useSelector(getUser);
  const isSelf = currentUser.uuid === user.uuid;

  return (
    <>
      <FirstNameRow user={user} isSelf={isSelf} disabled={disabled} />
      <LastNameRow user={user} isSelf={isSelf} disabled={disabled} />
      <NativeNameRow user={user} isSelf={isSelf} disabled={disabled} />
      <PhoneNumberRow user={user} isSelf={isSelf} disabled={disabled} />
      <EmailRow user={user} isSelf={isSelf} disabled={disabled} />
      <DateJoinedRow user={user} disabled={disabled} />
      <UserTypeRow user={user} isSelf={isSelf} disabled={disabled} />
      <CivilNumberRow user={user} disabled={disabled} />
      <OrganizationRow user={user} isSelf={isSelf} disabled={disabled} />
      <JobTitleRow user={user} isSelf={isSelf} disabled={disabled} />
      <AffiliationsRow user={user} disabled={disabled} />
      <DescriptionRow user={user} isSelf={isSelf} disabled={disabled} />
      <ShortnameRow user={user} currentUser={currentUser} disabled={disabled} />
      <NotificationsEnabledRow
        user={user}
        isSelf={isSelf}
        disabled={disabled}
      />
    </>
  );
};
