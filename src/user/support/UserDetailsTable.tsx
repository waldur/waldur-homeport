import { QuestionIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { User } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate, formatDateTime } from '@/core/dateUtils';
import { FieldWithCopy } from '@/core/FieldWithCopy';
import { Tip } from '@/core/Tooltip';
import { formatPhoneNumber } from '@/core/utils';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { formatUserIsActive, formatUserStatus } from '@/user/support/utils';
import { useUser } from '@/workspace/hooks';
import { checkIsStaffOrSupport } from '@/workspace/selectors';

import { EXTRA_PROFILE_FIELDS } from './extraProfileFields';
import { isProfileAttributeEnabled } from './profileAttributes';

interface OwnProps {
  user: User;
  profile?: any;
  hasHeader?: boolean;
}

export const UserDetailsTable: FunctionComponent<OwnProps> = (props) => {
  const user = useUser();
  const isVisible = checkIsStaffOrSupport(user);

  return (
    <FormTable hideActions alignTop detailsMode className="gy-5">
      <FormTable.Item
        label={translate('Full name')}
        value={<FieldWithCopy value={props.user.full_name} />}
      />

      {isProfileAttributeEnabled('native_name') && (
        <FormTable.Item
          label={translate('Native name')}
          value={<FieldWithCopy value={props.user.native_name} />}
        />
      )}
      <FormTable.Item
        label={translate('ID code')}
        value={<FieldWithCopy value={props.user.civil_number} />}
      />

      <FormTable.Item
        label={translate('Phone numbers')}
        value={
          <FieldWithCopy value={formatPhoneNumber(props.user.phone_number)} />
        }
      />

      <FormTable.Item
        label={translate('Username')}
        value={<FieldWithCopy value={props.user.username} />}
      />

      <FormTable.Item
        label={translate('Email')}
        value={<FieldWithCopy value={props.user.email} />}
      />

      {isFeatureVisible(UserFeatures.show_slug) && (
        <FormTable.Item
          label={translate('Shortname')}
          value={<FieldWithCopy value={props.user.slug} />}
        />
      )}
      {isFeatureVisible(UserFeatures.preferred_language) && (
        <FormTable.Item
          label={translate('Preferred language')}
          value={props.user.preferred_language}
        />
      )}
      <FormTable.Item
        label={translate('Registration method')}
        value={
          <div className="d-inline-flex align-items-center gap-2">
            <FieldWithCopy value={props.user.identity_provider_label} />
            {props.user.should_protect_user_details && (
              <Tip
                id="user-details-protected"
                label={translate(
                  'Profile fields (organization, name, email) are managed by the identity provider and cannot be edited in Waldur.',
                )}
              >
                <Badge variant="purple" outline>
                  {translate('Details protected')}
                </Badge>
              </Tip>
            )}
          </div>
        }
      />

      <FormTable.Item
        label={translate('Identity source')}
        value={<FieldWithCopy value={props.user.identity_source} />}
      />

      <FormTable.Item
        label={translate('Birth date')}
        value={
          <FieldWithCopy
            value={
              props.user.birth_date ? formatDate(props.user.birth_date) : null
            }
          />
        }
      />

      <FormTable.Item
        label={translate('Date joined')}
        value={<FieldWithCopy value={formatDateTime(props.user.date_joined)} />}
      />

      <FormTable.Item
        label={
          <span className="d-inline-flex align-items-center gap-1">
            {translate('Organization')}
            <Tip
              id="user-organization-tooltip"
              placement="top"
              label={translate(
                'Supplied by the identity provider. Auto-provisioning rules that match by organization name compare this value against Waldur customer names.',
              )}
            >
              <QuestionIcon size={16} weight="bold" className="text-muted" />
            </Tip>
          </span>
        }
        value={<FieldWithCopy value={props.user.organization} />}
      />

      <FormTable.Item
        label={translate('Job position')}
        value={<FieldWithCopy value={props.user.job_title} />}
      />

      {Array.isArray(props.user.affiliations) &&
      props.user.affiliations.length > 0 ? (
        <FormTable.Item
          label={translate('Affiliations')}
          value={<FieldWithCopy value={props.user.affiliations.join(', ')} />}
        />
      ) : null}

      {EXTRA_PROFILE_FIELDS.map((field) => {
        if (!isProfileAttributeEnabled(field.attr)) {
          return null;
        }
        const value = field.getValue(props.user);
        if (field.skipWhenEmpty && !value) {
          return null;
        }
        return (
          <FormTable.Item
            key={field.attr}
            label={field.label()}
            value={<FieldWithCopy value={value} />}
          />
        );
      })}

      {isVisible && (
        <FormTable.Item
          label={translate('User type')}
          value={formatUserStatus(props.user)}
        />
      )}
      {isVisible && (
        <FormTable.Item
          label={translate('Account status')}
          value={formatUserIsActive(props.user)}
        />
      )}
      {isVisible &&
        !props.user.is_active &&
        Boolean(props.user.deactivation_reason) && (
          <FormTable.Item
            label={translate('Deactivation reason')}
            value={<FieldWithCopy value={props.user.deactivation_reason} />}
          />
        )}
      {isVisible && props.user.is_admin_deactivated && (
        <FormTable.Item
          label={translate('Administrative status')}
          value={
            <div className="d-inline-flex align-items-center gap-2">
              <Badge variant="danger" outline>
                {translate('Administratively disabled')}
              </Badge>
              <Tip
                id="user-admin-deactivated-tooltip"
                label={translate(
                  'This account was disabled by an administrator. When automatic role-based deactivation is enabled, the system will not re-enable it automatically, even if the user regains roles. A staff member must reactivate it manually.',
                )}
              >
                <QuestionIcon size={16} weight="bold" className="text-muted" />
              </Tip>
            </div>
          }
        />
      )}
      {props.profile?.is_active && (
        <FormTable.Item
          label={translate('FreeIPA')}
          value={<FieldWithCopy value={props.profile?.username} />}
        />
      )}
    </FormTable>
  );
};
