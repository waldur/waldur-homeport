import { FunctionComponent, useCallback, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/notify';
import { formatUserStatus } from '@waldur/user/support/utils';
import { UserDetails } from '@waldur/workspace/types';

import { ChangeEmailButton } from './ChangeEmailButton';
import { FieldEditButton } from './FieldEditButton';
import { IdentityProviderContainer } from './IdentityProviderContainer';
import { TermsOfServiceCheckbox } from './TermsOfServiceCheckbox';
import { UserEditAvatarFormItem } from './UserEditAvatarFormItem';

const getDefaultRequiredMsg = (field, isSelf) =>
  isSelf
    ? translate('Your {field} is required', { field })
    : translate("The user's {field} is required", { field });

interface UserEditFormData {
  first_name?: string;
  last_name?: string;
  email?: string;
  user_status?: string;
  id_code?: string;
  organization?: string;
  job_position?: string;
  description?: string;
  phone_number?: string;
}
interface OwnProps {
  updateUser(data: UserEditFormData): Promise<void>;
  initial?: boolean;
  isVisibleForSupportOrStaff: boolean;
  fieldIsVisible: (field: string) => boolean;
  isRequired: (field: string) => boolean;
  nativeNameIsVisible: boolean;
  currentUser: UserDetails; // logged-in user
  user: UserDetails;
  fieldIsProtected(field: string): boolean;
}

export const UserEditForm: FunctionComponent<OwnProps> = (props) => {
  const isSelf = props.currentUser.uuid === props.user.uuid;

  const update = useCallback(
    async (formData, dispatch) => {
      try {
        const response = await props.updateUser(formData);
        dispatch(showSuccess(translate('Profile updated successfully')));
        return response;
      } catch (error) {
        dispatch(showError(error.message));
        // Throw exception to the edit dialog
        if (!('image' in formData)) {
          throw error;
        }
      }
    },
    [props.updateUser],
  );

  const detailsRows = useMemo(
    () =>
      [
        {
          label: translate('First name'),
          key: 'first_name',
          value: props.user.first_name,
          description: isSelf
            ? translate('Display your first name on your profile')
            : translate("Display the user's first name on their profile"),
          requiredMsg: props.isRequired('first_name')
            ? getDefaultRequiredMsg(translate('First name'), isSelf)
            : null,
          protected: props.fieldIsProtected('first_name'),
        },
        {
          label: translate('Last name'),
          key: 'last_name',
          value: props.user.last_name,
          description: isSelf
            ? translate('Display your last name on your profile')
            : translate("Display the user's last name on their profile"),
          requiredMsg: props.isRequired('last_name')
            ? getDefaultRequiredMsg(translate('Last name'), isSelf)
            : null,
          protected: props.fieldIsProtected('last_name'),
        },
        props.nativeNameIsVisible
          ? {
              label: translate('Native name'),
              key: 'native_name',
              value: props.user.native_name,
              requiredMsg: props.isRequired('native_name')
                ? getDefaultRequiredMsg(translate('Native name'), isSelf)
                : null,
              protected: props.fieldIsProtected('native_name'),
            }
          : null,
        props.fieldIsVisible('phone_number')
          ? {
              label: translate('Phone number'),
              key: 'phone_number',
              value: props.user.phone_number,
              protected: props.fieldIsProtected('phone_number'),
              requiredMsg: props.isRequired('phone_number')
                ? translate('{pronoun} phone number', {
                    pronoun: isSelf ? translate('Your') : translate("User's"),
                  })
                : null,
              description: isSelf
                ? translate('Enter your contact number')
                : translate('Enter a contact number for the user'),
            }
          : null,
        {
          label: translate('Email'),
          key: 'email',
          value: props.user.email,
          protected: props.fieldIsProtected('email'),
          requiredMsg: props.isRequired('email')
            ? translate(
                '{pronoun} email is required for account notifications and password recovery',
                { pronoun: isSelf ? translate('Your') : translate("User's") },
              )
            : null,
          description: isSelf
            ? translate(
                'Provide an email address for communication and recovery',
              )
            : translate(
                "Provide an email address for the user's communication and recovery",
              ),
          actions: !props.fieldIsProtected('email') ? (
            <ChangeEmailButton
              user={props.user}
              protected={props.fieldIsProtected('email')}
            />
          ) : null,
        },
        {
          label: translate('Date joined'),
          value: formatDateTime(props.user.date_joined),
          key: 'date_joined',
          protected: true,
          protectedMsg: translate('Read-only field'),
          description: translate('The date the user has joined'),
        },
        props.isVisibleForSupportOrStaff
          ? {
              label: translate('User type'),
              value: formatUserStatus(props.user),
              key: 'type',
              protected: true,
              description: isSelf
                ? translate('Describe your user account type')
                : translate("Describe user's account type"),
            }
          : null,
        props.user.civil_number
          ? {
              label: translate('ID code'),
              value: props.user.civil_number,
              protected: true,
              key: translate('civil_number'),
            }
          : null,
        props.fieldIsVisible('organization')
          ? {
              label: translate('Organization name'),
              key: 'organization',
              value: props.user.organization,
              protected: props.fieldIsProtected('organization'),
              description: isSelf
                ? translate(
                    'Specify the name of the organization you are affiliated with',
                  )
                : translate(
                    'Specify the name of the organization the user is affiliated with',
                  ),
            }
          : null,
        props.fieldIsVisible('job_title')
          ? {
              label: translate('Job position'),
              key: 'job_title',
              value: props.user.job_title,
              protected: props.fieldIsProtected('job_title'),
              description: isSelf
                ? translate(
                    'Describe your role or position within the organization',
                  )
                : translate(
                    "Describe the user's role or position within the organization",
                  ),
            }
          : null,
        Array.isArray(props.user.affiliations) &&
        props.user.affiliations.length > 0
          ? {
              label: translate('Affiliations'),
              value: props.user.affiliations.join(', '),
              key: 'affiliations',
              protected: true,
            }
          : null,
        props.isVisibleForSupportOrStaff
          ? {
              label: translate('Description'),
              value: props.user.description,
              key: 'description',
              description: translate(
                'Additional account description invisible to user',
              ),
              requiredMsg: props.isRequired('description')
                ? getDefaultRequiredMsg(translate('Description'), isSelf)
                : null,
            }
          : null,
        isFeatureVisible(UserFeatures.show_slug)
          ? {
              label: translate('Shortname'),
              value: props.user.slug,
              protected: !props.currentUser.is_staff,
              key: 'slug',
            }
          : null,
      ].filter(Boolean),
    [
      props.user,
      props.nativeNameIsVisible,
      props.fieldIsProtected,
      props.fieldIsVisible,
      props.isVisibleForSupportOrStaff,
    ],
  );

  return (
    <>
      <IdentityProviderContainer user={props.user} />
      <FormTable.Card
        title={translate('Profile settings')}
        className="card-bordered mb-7"
      >
        <FormTable>
          {isSelf && (
            <FormTable.Item
              value={
                <TermsOfServiceCheckbox user={props.user} update={update} />
              }
            />
          )}
          <UserEditAvatarFormItem
            user={props.user}
            callback={update}
            isSelf={isSelf}
          />
          {detailsRows.map((row) => (
            <FormTable.Item
              key={row.key}
              label={row.label}
              description={row.description}
              value={row.value || '—'}
              warnTooltip={row.requiredMsg}
              actions={
                row.actions || (
                  <FieldEditButton
                    user={props.user}
                    name={row.key}
                    label={row.label}
                    description={row.description}
                    callback={update}
                    requiredMsg={row.requiredMsg}
                    protected={row.protected}
                    protectedMsg={row.protectedMsg}
                  />
                )
              }
            />
          ))}
        </FormTable>
      </FormTable.Card>
    </>
  );
};
