import { FunctionComponent } from 'react';
import { User } from 'waldur-js-client';

import { HelpIcon, PropertyItem, PropertyList, Tooltip } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { formatPhoneNumber } from '@/core/utils';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { KeyValueButton } from '@/marketplace/resources/KeyValueButton';
import { propVal } from '@/property/propertyFields';
import { renderFieldOrDash } from '@/table/utils';
import { formatUserStatus } from '@/user/support/utils';
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
    <PropertyList hideActions alignTop detailsMode>
      <PropertyItem
        label={translate('Full name')}
        value={props.user.full_name}
        hasCopy
      />

      {isProfileAttributeEnabled('native_name') && (
        <PropertyItem
          label={translate('Native name')}
          value={props.user.native_name}
          hasCopy
        />
      )}
      <PropertyItem
        label={translate('ID code')}
        value={props.user.civil_number}
        hasCopy
      />

      <PropertyItem
        label={translate('Phone numbers')}
        value={formatPhoneNumber(props.user.phone_number)}
        hasCopy
      />

      <PropertyItem
        label={translate('Username')}
        value={props.user.username}
        hasCopy
      />

      <PropertyItem
        label={translate('Email')}
        value={props.user.email}
        hasCopy
      />

      {isFeatureVisible(UserFeatures.show_slug) && (
        <PropertyItem
          label={translate('Shortname')}
          value={props.user.slug}
          hasCopy
        />
      )}
      {isFeatureVisible(UserFeatures.preferred_language) && (
        <PropertyItem
          label={translate('Preferred language')}
          value={props.user.preferred_language}
        />
      )}
      <PropertyItem
        label={translate('Registration method')}
        value={
          <div className="flex items-center gap-1.5">
            {renderFieldOrDash(props.user.identity_provider_label)}
            {props.user.should_protect_user_details && (
              <Tooltip
                label={translate(
                  'Profile fields (organization, name, email) are managed by the identity provider and cannot be edited in Waldur.',
                )}
              >
                <Badge variant="purple" tone="outline">
                  {translate('Details protected')}
                </Badge>
              </Tooltip>
            )}
          </div>
        }
        copyValue={props.user.identity_provider_label || undefined}
      />

      <PropertyItem
        label={translate('Identity source')}
        value={props.user.identity_source}
        hasCopy
      />

      {/* Raw claims the identity provider asserted, for the claims listed in
          its extra fields. Auto-provisioning rules match on these to grant
          roles, so this is the surface for answering "why did (or didn't) a
          rule fire for this user". Staff and support only — the backend omits
          the field entirely for everyone else. */}
      {isVisible && Object.keys(props.user.details ?? {}).length > 0 && (
        <PropertyItem
          label={translate('Identity provider claims')}
          value={
            <KeyValueButton
              items={props.user.details}
              title={translate('Identity provider claims')}
            />
          }
        />
      )}

      {isProfileAttributeEnabled('uid_number') &&
        props.user.uid_number != null && (
          <PropertyItem
            label={translate('POSIX UID')}
            value={props.user.uid_number}
            hasCopy
          />
        )}

      {isProfileAttributeEnabled('primary_gid') &&
        props.user.primary_gid != null && (
          <PropertyItem
            label={translate('POSIX primary GID')}
            value={props.user.primary_gid}
            hasCopy
          />
        )}

      <PropertyItem
        label={translate('Birth date')}
        value={propVal.date(props.user.birth_date)}
        hasCopy
      />

      <PropertyItem
        label={translate('Date joined')}
        value={propVal.date(props.user.date_joined, { precision: 'datetime' })}
        hasCopy
      />

      <PropertyItem
        label={
          <span className="inline-flex items-center gap-1">
            {translate('Organization')}
            <HelpIcon
              side="top"
              label={translate(
                'Supplied by the identity provider. Auto-provisioning rules that match by organization name compare this value against Waldur customer names.',
              )}
            />
          </span>
        }
        value={props.user.organization}
        hasCopy
      />

      <PropertyItem
        label={translate('Job position')}
        value={props.user.job_title}
        hasCopy
      />

      {Array.isArray(props.user.affiliations) &&
      props.user.affiliations.length > 0 ? (
        <PropertyItem
          label={translate('Affiliations')}
          value={propVal.list(props.user.affiliations)}
          hasCopy
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
          <PropertyItem
            key={field.attr}
            label={field.label()}
            value={value}
            hasCopy
          />
        );
      })}

      {isVisible && (
        <PropertyItem
          label={translate('User type')}
          value={formatUserStatus(props.user)}
        />
      )}
      {isVisible && (
        <PropertyItem
          label={translate('Account status')}
          value={propVal.boolean(props.user.is_active, {
            wording: [translate('Active'), translate('Disabled')],
          })}
        />
      )}
      {isVisible &&
        !props.user.is_active &&
        Boolean(props.user.deactivation_reason) && (
          <PropertyItem
            label={translate('Deactivation reason')}
            value={props.user.deactivation_reason}
            hasCopy
          />
        )}
      {isVisible && props.user.is_admin_deactivated && (
        <PropertyItem
          label={translate('Administrative status')}
          value={
            <div className="inline-flex items-center gap-1.5">
              <Badge variant="danger" tone="outline">
                {translate('Administratively disabled')}
              </Badge>
              <HelpIcon
                label={translate(
                  'This account was disabled by an administrator. When automatic role-based deactivation is enabled, the system will not re-enable it automatically, even if the user regains roles. A staff member must reactivate it manually.',
                )}
              />
            </div>
          }
        />
      )}
      {props.profile?.is_active && (
        <PropertyItem
          label={translate('FreeIPA')}
          value={props.profile?.username}
          hasCopy
        />
      )}
    </PropertyList>
  );
};
