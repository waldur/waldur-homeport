import { WarningCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { marketplaceOfferingTermsOfServiceList } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { FeaturedIcon } from '@waldur/core/FeaturedIcon';
import { translate } from '@waldur/i18n';
import { router } from '@waldur/router';
import { setFilterQuery } from '@waldur/table/actions';
import { USER_TOS_MANAGEMENT_TABLE_ID } from '@waldur/user/constants';
import { useUser } from '@waldur/workspace/hooks';

interface TosConsentWarningBannerProps {
  offering: {
    uuid?: string;
    name?: string;
    plugin_options?: {
      service_provider_can_create_offering_user?: boolean;
    };
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
    staleTime: 5 * 60 * 1000,
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
    <div className="h-60px bg-body border-bottom">
      <div className="container-fluid d-flex align-items-center h-100">
        <div className="d-flex align-items-center">
          {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
          <FeaturedIcon
            IconComponent={WarningCircleIcon}
            variant="warning"
            className="me-2"
          />
          <p className="mb-0">
            <strong>{translate('Access restricted: ToS not accepted.')}</strong>{' '}
            <span className="text-gray-500">
              {translate(
                "Accept the Terms of Service for this resource's offering before using it.",
              )}
            </span>
          </p>
        </div>
        <div className="ms-auto">
          <Button
            variant="tertiary"
            size="sm"
            onClick={handleViewTos}
            className="ms-3"
          >
            {translate('Review in profile')}
          </Button>
        </div>
      </div>
    </div>
  );
};
