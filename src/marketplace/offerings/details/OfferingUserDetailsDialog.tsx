import { UserGearIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  marketplaceOfferingUsersRetrieve,
  marketplaceProviderOfferingsUserAttributeConfigRetrieve,
  OfferingUser,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { UI_STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { FieldWithCopy } from '@/core/FieldWithCopy';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { OfferingUserStateField } from '@/marketplace/OfferingUserStateField';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { formatGender } from '@/user/support/aai-constants';
import { IsdBadges } from '@/user/support/IsdBadges';

interface OfferingUserDetailsDialogProps {
  resolve: { offeringUserUuid: string; offeringUuid: string };
}

// Maps exposed_fields values to OfferingUser properties
export const FIELD_MAPPING: Record<
  string,
  {
    label: () => string;
    getValue: (user: OfferingUser) => string | unknown;
  }
> = {
  full_name: {
    label: () => translate('Full name'),
    getValue: (user) => user.user_full_name,
  },
  email: {
    label: () => translate('Email'),
    getValue: (user) => user.user_email,
  },
  phone_number: {
    label: () => translate('Phone number'),
    getValue: (user) => user.user_phone_number,
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
  },
  organization_vat_code: {
    label: () => translate('Organization VAT code'),
    getValue: (user) => user.user_organization_vat_code,
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
  },
  birth_date: {
    label: () => translate('Birth date'),
    getValue: (user) => user.user_birth_date,
  },
  identity_source: {
    label: () => translate('Registration method'),
    getValue: (user) => user.user_identity_source,
  },
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return DASH_ESCAPE_CODE;
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : DASH_ESCAPE_CODE;
  }
  return String(value);
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

  const exposedUserAttributes = useMemo(() => {
    if (!config?.exposed_fields || !offeringUser) return [];
    return config.exposed_fields
      .filter((field) => FIELD_MAPPING[field])
      .map((field) => ({
        key: field,
        label: FIELD_MAPPING[field].label(),
        value: formatValue(FIELD_MAPPING[field].getValue(offeringUser)),
      }));
  }, [config, offeringUser]);

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
        <FormTable hideActions detailsMode className="gy-5">
          {/* Exposed user attributes from config */}
          {exposedUserAttributes.map((attr) => (
            <FormTable.Item
              key={attr.key}
              label={attr.label}
              value={<FieldWithCopy value={attr.value} />}
            />
          ))}

          {/* Always show offering-specific fields */}
          <FormTable.Item
            label={translate('Offering username')}
            value={<FieldWithCopy value={formatValue(offeringUser.username)} />}
          />
          <FormTable.Item
            label={translate('State')}
            value={<OfferingUserStateField row={offeringUser} />}
          />
          {offeringUser.is_restricted !== undefined && (
            <FormTable.Item
              label={translate('Restricted')}
              value={
                offeringUser.is_restricted ? translate('Yes') : translate('No')
              }
            />
          )}
          {ENV.plugins.WALDUR_CORE
            .ENFORCE_OFFERING_USER_PROFILE_COMPLETENESS && (
            <>
              <FormTable.Item
                label={translate('Profile complete')}
                value={
                  offeringUser.is_profile_complete
                    ? translate('Yes')
                    : translate('No')
                }
              />
              {offeringUser.is_profile_complete === false &&
                offeringUser.missing_profile_attributes?.length > 0 && (
                  <FormTable.Item
                    label={translate('Missing attributes')}
                    value={offeringUser.missing_profile_attributes
                      .map((key) => {
                        const mapping = FIELD_MAPPING[key];
                        return mapping
                          ? mapping.label()
                          : key
                              .replace(/_/g, ' ')
                              .replace(/^\w/, (c) => c.toUpperCase());
                      })
                      .join(', ')}
                  />
                )}
            </>
          )}
          {offeringUser.service_provider_comment && (
            <FormTable.Item
              label={translate('Service provider comment')}
              value={
                <FieldWithCopy value={offeringUser.service_provider_comment} />
              }
            />
          )}
          {offeringUser.service_provider_comment_url && (
            <FormTable.Item
              label={translate('Service provider comment URL')}
              value={
                <a
                  href={offeringUser.service_provider_comment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {offeringUser.service_provider_comment_url}
                </a>
              }
            />
          )}
          <FormTable.Item
            label={translate('Created')}
            value={formatDateTime(offeringUser.created)}
          />
          {offeringUser.modified && (
            <FormTable.Item
              label={translate('Modified')}
              value={formatDateTime(offeringUser.modified)}
            />
          )}
          {isFeatureVisible(UserFeatures.show_identity_bridge) &&
            Array.isArray(offeringUser.user_active_isds) &&
            offeringUser.user_active_isds.length > 0 && (
              <FormTable.Item
                label={translate('Active ISDs')}
                value={<IsdBadges isds={offeringUser.user_active_isds} />}
              />
            )}
        </FormTable>
      ) : null}
    </ModalDialog>
  );
};
