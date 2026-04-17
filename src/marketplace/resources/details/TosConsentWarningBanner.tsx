import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  marketplaceOfferingTermsOfServiceList,
  OfferingState,
} from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { STALE_TIME } from '@waldur/core/constants';
import { translate } from '@waldur/i18n';
import { router } from '@waldur/router';
import { setFilterQuery } from '@waldur/table/actions';
import { USER_TOS_MANAGEMENT_TABLE_ID } from '@waldur/user/constants';
import { useUser } from '@waldur/workspace/hooks';

import { ResourceWarningBar } from './ResourceWarningBar';

interface TosConsentWarningBannerProps {
  offering: {
    uuid?: string;
    name?: string;
    plugin_options?: {
      service_provider_can_create_offering_user?: boolean;
    };
    state?: OfferingState;
  };
  userHasConsent?: boolean;
}

export const TosConsentWarningBanner: FC<TosConsentWarningBannerProps> = ({
  offering,
  userHasConsent,
}) => {
  const user = useUser();
  const dispatch = useDispatch();
  const { data: hasActiveTos = false } = useQuery({
    queryKey: ['offering-active-tos', offering.uuid],
    enabled: Boolean(offering?.uuid),
    queryFn: async () => {
      const response = await marketplaceOfferingTermsOfServiceList({
        query: { offering_uuid: offering.uuid!, is_active: true },
      });
      return (response.data?.length || 0) > 0;
    },
    staleTime: STALE_TIME,
  });
  const handleViewTos = () => {
    router.stateService.go('profile.tos-management').then(() => {
      setTimeout(() => {
        dispatch(setFilterQuery(USER_TOS_MANAGEMENT_TABLE_ID, offering.name));
      }, 100);
    });
  };

  const shouldShowBanner = useMemo(() => {
    const enforceConsent =
      ENV.plugins.WALDUR_CORE.ENFORCE_USER_CONSENT_FOR_OFFERINGS;
    const canCreateUser =
      offering.plugin_options?.service_provider_can_create_offering_user;

    return (
      !user.is_staff &&
      enforceConsent &&
      canCreateUser &&
      hasActiveTos &&
      userHasConsent === false
    );
  }, [
    offering.plugin_options?.service_provider_can_create_offering_user,
    hasActiveTos,
    userHasConsent,
  ]);

  if (!shouldShowBanner) {
    return null;
  }

  return (
    <ResourceWarningBar
      className={offering.state === 'Unavailable' ? 'disabled-view' : undefined}
      actions={
        <button
          type="button"
          className="btn btn-warning text-orange fw-semibold px-4 py-2 ms-3 btn-sm"
          onClick={handleViewTos}
        >
          {translate('Review in profile')}
        </button>
      }
    >
      <p className="mb-0">
        <strong>{translate('Access restricted: ToS not accepted.')}</strong>{' '}
        <span>
          {translate(
            "Accept the Terms of Service for this resource's offering before using it.",
          )}
        </span>
      </p>
    </ResourceWarningBar>
  );
};
