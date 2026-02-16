import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { OfferingState, marketplaceOfferingUsersList } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';
import { FIELD_MAPPING } from '@waldur/marketplace/offerings/details/OfferingUserDetailsDialog';
import { router } from '@waldur/router';
import { useUser } from '@waldur/workspace/hooks';

import { ResourceWarningBar } from './ResourceWarningBar';

interface ProfileCompletenessWarningBannerProps {
  offering: {
    uuid?: string;
    plugin_options?: {
      service_provider_can_create_offering_user?: boolean;
    };
    state?: OfferingState;
  };
}

const getAttributeLabel = (key: string): string => {
  const mapping = FIELD_MAPPING[key];
  if (mapping) {
    return mapping.label();
  }
  // Fallback: replace underscores with spaces and capitalize
  return key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
};

export const ProfileCompletenessWarningBanner: FC<
  ProfileCompletenessWarningBannerProps
> = ({ offering }) => {
  const user = useUser();

  const enforceProfileCompleteness =
    ENV.plugins.WALDUR_CORE.ENFORCE_OFFERING_USER_PROFILE_COMPLETENESS;
  const canCreateUser =
    offering.plugin_options?.service_provider_can_create_offering_user;

  const enabled = Boolean(
    enforceProfileCompleteness &&
    canCreateUser &&
    !user?.is_staff &&
    user?.uuid &&
    offering?.uuid,
  );

  const { data: offeringUser } = useQuery({
    queryKey: ['profile-completeness-check', user?.uuid, offering?.uuid],
    queryFn: () =>
      marketplaceOfferingUsersList({
        query: {
          user_uuid: user.uuid,
          offering_uuid: [offering.uuid],
          field: ['uuid', 'is_profile_complete', 'missing_profile_attributes'],
        },
      }).then((response) => response.data?.[0] || null),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const shouldShowBanner = useMemo(
    () => enabled && offeringUser?.is_profile_complete === false,
    [enabled, offeringUser],
  );

  if (!shouldShowBanner) {
    return null;
  }

  const missingAttributes = offeringUser?.missing_profile_attributes || [];
  const missingLabels = missingAttributes.map(getAttributeLabel).join(', ');

  const handleCompleteProfile = () => {
    router.stateService.go('profile-manage');
  };

  return (
    <ResourceWarningBar
      className={offering.state === 'Unavailable' ? 'disabled-view' : undefined}
      actions={
        <button
          type="button"
          className="btn btn-warning text-orange fw-semibold px-4 py-2 ms-3 btn-sm"
          onClick={handleCompleteProfile}
        >
          {translate('Complete profile')}
        </button>
      }
    >
      <p className="mb-0">
        <strong>
          {translate('Your profile is incomplete for this offering.')}
        </strong>{' '}
        {missingLabels && (
          <span>
            {translate('Missing attributes: {attributes}', {
              attributes: missingLabels,
            })}
          </span>
        )}
      </p>
    </ResourceWarningBar>
  );
};
