import { LockSimpleIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { User } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatDateTime } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { formatIsdName } from './IsdBadges';

const fieldIsProtected = (user: User, field: string) =>
  user.identity_provider_fields.includes(field) ||
  (
    ENV.plugins.WALDUR_CORE.PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS || []
  ).includes(user.registration_method);

export const getProtectedFieldProps = (
  user: User,
  field: string,
  required: boolean,
  value: any,
) => {
  const isProtected = fieldIsProtected(user, field);
  const isEmpty =
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);
  const showProtectedMissingWarning = required && isEmpty && isProtected;

  const attributeSource = isFeatureVisible(UserFeatures.show_identity_bridge)
    ? (user.attribute_sources as any)?.[field]
    : undefined;

  const tooltip = isProtected
    ? attributeSource?.source
      ? translate('Managed by {source}. Last synced: {date}', {
          source: formatIsdName(attributeSource.source),
          date: formatDateTime(attributeSource.timestamp),
        })
      : user.identity_provider_label
        ? translate('Information is coming from {identityProvider}', {
            identityProvider: user.identity_provider_label,
          })
        : translate('Information is coming from identity provider')
    : undefined;

  const renderValue = showProtectedMissingWarning
    ? (val: any) => (
        <span className="d-inline-flex align-items-center gap-2">
          <span>{renderFieldOrDash(val)}</span>
          <Tip
            label={translate('Required field not provided by {idp}', {
              idp:
                user.identity_provider_label || translate('identity provider'),
            })}
            id={`${field}-warning`}
          >
            <WarningCircleIcon
              size={16}
              weight="bold"
              className="text-warning"
            />
          </Tip>
        </span>
      )
    : undefined;

  return {
    isProtected,
    tooltip,
    iconNode: isProtected ? <LockSimpleIcon weight="bold" /> : undefined,
    renderValue,
  };
};
