import { UserGearIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  marketplaceOfferingUsersRetrieve,
  marketplaceProviderOfferingsUserAttributeConfigRetrieve,
  OfferingUser,
} from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { ENV } from '@/core/config';
import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { OfferingUserStateField } from '@/marketplace/OfferingUserStateField';
import {
  isProviderBacked,
  ProviderAccountButton,
} from '@/marketplace/service-providers/accounts/ProviderAccountLink';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { propVal } from '@/property/propertyFields';
import { formatGender } from '@/user/support/aai-constants';
import { formatIsdName } from '@/user/support/IsdBadges';

interface OfferingUserDetailsDialogProps {
  resolve: { offeringUserUuid: string; offeringUuid: string };
}

export interface FieldMappingEntry {
  label: () => string;
  getValue: (user: OfferingUser) => string | unknown;
  copyable?: boolean;
  format?: (value: any, user: OfferingUser) => any;
}

// Maps exposed_fields values to OfferingUser properties
export const FIELD_MAPPING: Record<string, FieldMappingEntry> = {
  full_name: {
    label: () => translate('Full name'),
    getValue: (user) => user.user_full_name,
    copyable: true,
  },
  email: {
    label: () => translate('Email'),
    getValue: (user) => user.user_email,
    copyable: true,
  },
  phone_number: {
    label: () => translate('Phone number'),
    getValue: (user) => user.user_phone_number,
    copyable: true,
  },
  organization: {
    label: () => translate('Organization'),
    getValue: (user) => user.user_organization,
  },
  job_title: {
    label: () => translate('Job title'),
    getValue: (user) => user.user_job_title,
  },
  affiliations: {
    label: () => translate('Affiliations'),
    getValue: (user) => user.user_affiliations,
    format: (v) => propVal.list(v),
  },
  gender: {
    label: () => translate('Gender'),
    getValue: (user) => formatGender(user.user_gender),
  },
  personal_title: {
    label: () => translate('Personal title'),
    getValue: (user) => user.user_personal_title,
  },
  place_of_birth: {
    label: () => translate('Place of birth'),
    getValue: (user) => user.user_place_of_birth,
  },
  country_of_residence: {
    label: () => translate('Country of residence'),
    getValue: (user) => user.user_country_of_residence,
  },
  nationality: {
    label: () => translate('Nationality'),
    getValue: (user) => user.user_nationality,
  },
  nationalities: {
    label: () => translate('Nationalities'),
    getValue: (user) => user.user_nationalities,
    format: (v) => propVal.list(v),
  },
  organization_country: {
    label: () => translate('Organization country'),
    getValue: (user) => user.user_organization_country,
  },
  organization_type: {
    label: () => translate('Organization type'),
    getValue: (user) => user.user_organization_type,
  },
  organization_registry_code: {
    label: () => translate('Organization registry code'),
    getValue: (user) => user.user_organization_registry_code,
    copyable: true,
  },
  organization_vat_code: {
    label: () => translate('Organization VAT code'),
    getValue: (user) => user.user_organization_vat_code,
    copyable: true,
  },
  organization_address: {
    label: () => translate('Organization address'),
    getValue: (user) => user.user_organization_address,
  },
  eduperson_assurance: {
    label: () => translate('EduPerson assurance'),
    getValue: (user) => user.user_eduperson_assurance,
  },
  civil_number: {
    label: () => translate('Civil number'),
    getValue: (user) => user.user_civil_number,
    copyable: true,
  },
  birth_date: {
    label: () => translate('Birth date'),
    getValue: (user) => user.user_birth_date,
    format: (v) => propVal.date(v),
  },
  identity_source: {
    label: () => translate('Registration method'),
    getValue: (user) => user.user_identity_source,
  },
};

/** The labels of the profile attributes an offering user is missing. */
export const getMissingAttributeLabels = (keys: string[]) =>
  keys.map((key) => {
    const mapping = FIELD_MAPPING[key];
    return mapping
      ? mapping.label()
      : key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  });

/** The user attributes an offering's config exposes, labelled and formatted. */
export const getExposedUserAttributes = (
  config: { exposed_fields?: string[] } | null | undefined,
  offeringUser: OfferingUser | null | undefined,
) => {
  if (!config?.exposed_fields || !offeringUser) return [];
  return config.exposed_fields
    .filter((field) => FIELD_MAPPING[field])
    .map((field) => {
      const mapping = FIELD_MAPPING[field];
      const rawValue = mapping.getValue(offeringUser);
      const value = mapping.format
        ? mapping.format(rawValue, offeringUser)
        : rawValue;
      return {
        key: field,
        label: mapping.label(),
        value,
        copyable: mapping.copyable,
      };
    });
};

export const OfferingUserDetailsDialog: FC<OfferingUserDetailsDialogProps> = ({
  resolve: { offeringUserUuid, offeringUuid },
}) => {
  const {
    data: config,
    isLoading: isLoadingConfig,
    error: configError,
    refetch: refetchConfig,
  } = useQuery({
    queryKey: ['offering-user-attribute-config', offeringUuid],
    queryFn: () =>
      marketplaceProviderOfferingsUserAttributeConfigRetrieve({
        path: { uuid: offeringUuid },
      }).then((response) => response.data),
    staleTime: UI_STALE_TIME,
  });

  const {
    data: offeringUser,
    isLoading: isLoadingOfferingUser,
    error: offeringUserError,
    refetch: refetchOfferingUser,
  } = useQuery({
    queryKey: ['offering-user', offeringUserUuid],
    queryFn: () =>
      marketplaceOfferingUsersRetrieve({
        path: { uuid: offeringUserUuid },
      }).then((response) => response.data),
    staleTime: UI_STALE_TIME,
  });

  const isLoading = isLoadingConfig || isLoadingOfferingUser;
  const error = configError || offeringUserError;
  const refetch = () => {
    refetchConfig();
    refetchOfferingUser();
  };

  const exposedUserAttributes = useMemo(
    () => getExposedUserAttributes(config, offeringUser),
    [config, offeringUser],
  );

  return (
    <ModalDialog
      title={translate('Offering user details')}
      iconNode={<UserGearIcon weight="bold" />}
      iconColor="success"
      footer={<CloseDialogButton />}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={
            offeringUserError && !configError
              ? translate('Unable to load offering user.')
              : translate('Unable to load user attribute configuration.')
          }
          loadData={refetch}
        />
      ) : offeringUser ? (
        <PropertyList termWidth="md">
          {/* Exposed user attributes from config */}
          {exposedUserAttributes.map((attr) => (
            <PropertyItem
              key={attr.key}
              label={attr.label}
              value={attr.value}
              copyable={attr.copyable}
            />
          ))}

          {/* Always show offering-specific fields */}
          <PropertyItem
            label={translate('Offering username')}
            value={offeringUser.username}
            copyable
          />
          {isProviderBacked(offeringUser) && (
            <PropertyItem
              label={translate('Provider account')}
              value={
                <>
                  <ProviderAccountButton row={offeringUser} />
                  <div className="text-quaternary text-xs mt-1">
                    {translate(
                      'The username and POSIX attributes are managed on the provider account and shared with the provider’s other offerings.',
                    )}
                  </div>
                </>
              }
            />
          )}
          <PropertyItem
            label={translate('State')}
            value={<OfferingUserStateField row={offeringUser} />}
          />
          <PropertyItem
            label={translate('Restricted')}
            value={propVal.boolean(offeringUser.is_restricted)}
            hideIfEmpty
          />
          {ENV.plugins.WALDUR_CORE
            .ENFORCE_OFFERING_USER_PROFILE_COMPLETENESS && (
            <>
              <PropertyItem
                label={translate('Profile complete')}
                value={propVal.boolean(offeringUser.is_profile_complete)}
              />
              <PropertyItem
                label={translate('Missing attributes')}
                value={
                  offeringUser.is_profile_complete === false
                    ? propVal.list(
                        getMissingAttributeLabels(
                          offeringUser.missing_profile_attributes,
                        ),
                      )
                    : null
                }
                hideIfEmpty
              />
            </>
          )}
          <PropertyItem
            label={translate('Service provider comment')}
            value={offeringUser.service_provider_comment}
            copyable
            hideIfEmpty
          />
          <PropertyItem
            label={translate('Service provider comment URL')}
            value={propVal.url(offeringUser.service_provider_comment_url)}
            hideIfEmpty
          />
          <PropertyItem
            label={translate('Created')}
            value={propVal.date(offeringUser.created, {
              precision: 'datetime',
            })}
          />
          <PropertyItem
            label={translate('Modified')}
            value={propVal.date(offeringUser.modified, {
              precision: 'datetime',
            })}
            hideIfEmpty
          />
          {isFeatureVisible(UserFeatures.show_identity_bridge) && (
            <PropertyItem
              label={translate('Active ISDs')}
              value={propVal.badgeList(
                Array.isArray(offeringUser.user_active_isds)
                  ? (offeringUser.user_active_isds as string[]).map(
                      formatIsdName,
                    )
                  : null,
                { variant: 'primary', tone: 'outline' },
              )}
              copyable
              hideIfEmpty
            />
          )}
        </PropertyList>
      ) : null}
    </ModalDialog>
  );
};
