import {
  SignInIcon,
  BuildingsIcon,
  RocketLaunchIcon,
  CertificateIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  marketplaceGlobalCategoriesRetrieve,
  marketplacePublicOfferingsList,
  onboardingVerificationsList,
  userInvitationsList,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import {
  CustomerFeatures,
  MarketplaceFeatures,
  UserFeatures,
} from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { openModalDialog } from '@/modal/actions';
import { router } from '@/router';
import { useUser } from '@/workspace/hooks';

import { UserAffiliationsList } from '../affiliations/UserAffiliationsList';

import { DashboardCard } from './DashboardCard';
import { UserPendingActionsList } from './UserPendingActionsList';
import { UserResourcesDialog } from './UserResourcesWidget';

const ActiveInvitationsDialog = lazyComponent(() =>
  import('./ActiveInvitationsDialog').then((m) => ({
    default: m.ActiveInvitationsDialog,
  })),
);

export const UserDashboard: FC = () => {
  const dispatch = useDispatch();
  const user = useUser();
  const [invitationsCount, setInvitationsCount] = useState<number>(0);
  const [_isLoadingInvitations, setIsLoadingInvitations] =
    useState<boolean>(true);
  const [escalatedVerificationsCount, setEscalatedVerificationsCount] =
    useState<number>(0);
  const [_isLoadingVerifications, setIsLoadingVerifications] =
    useState<boolean>(true);
  const [pendingConsentsCount, setPendingConsentsCount] = useState<number>(0);
  const [_isLoadingConsents, setIsLoadingConsents] = useState<boolean>(true);

  // Reuse the same query as sidebar ResourcesMenu for resource counts
  const { data: counters } = useQuery({
    queryKey: ['ResourcesMenu', 'Counters', user?.uuid, undefined, undefined],
    queryFn: () =>
      marketplaceGlobalCategoriesRetrieve({}).then((response) => response.data),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const resourcesCount = useMemo((): number => {
    if (!counters) return 0;
    return Object.values(counters).reduce<number>(
      (acc, count) => acc + (Number(count) || 0),
      0,
    );
  }, [counters]);

  const showOnboardingWidgets = isFeatureVisible(
    CustomerFeatures.show_onboarding,
  );
  const showTosWidget = isFeatureVisible(MarketplaceFeatures.display_user_tos);

  useEffect(() => {
    if (!user) return;
    const fetchInvitationsCount = async () => {
      try {
        setIsLoadingInvitations(true);
        const response = await userInvitationsList({
          query: {
            email_exact: user.email,
            state: ['pending', 'project'],
            page_size: 1,
          },
        });
        const invitationCount = fetchResultCount(response);
        setInvitationsCount(invitationCount);
      } catch {
        setInvitationsCount(0);
      } finally {
        setIsLoadingInvitations(false);
      }
    };

    fetchInvitationsCount();
  }, [user?.email]);

  useEffect(() => {
    if (!user || !showOnboardingWidgets) return;
    const fetchEscalatedVerificationsCount = async () => {
      try {
        setIsLoadingVerifications(true);
        const response = await onboardingVerificationsList({
          query: {
            user_uuid: user.uuid,
            status: ['Escalated for manual validation'],
            page_size: 1,
          },
        });
        const count = fetchResultCount(response);
        setEscalatedVerificationsCount(count);
      } catch {
        setEscalatedVerificationsCount(0);
      } finally {
        setIsLoadingVerifications(false);
      }
    };

    fetchEscalatedVerificationsCount();
  }, [user?.uuid, showOnboardingWidgets]);

  useEffect(() => {
    if (!user || !showTosWidget) return;
    const fetchPendingConsentsCount = async () => {
      try {
        setIsLoadingConsents(true);
        const response = await marketplacePublicOfferingsList({
          query: {
            has_active_terms_of_service: true,
            user_has_offering_user: true,
            user_has_consent: false,
            page_size: 1,
          },
        });
        setPendingConsentsCount(fetchResultCount(response));
      } catch {
        setPendingConsentsCount(0);
      } finally {
        setIsLoadingConsents(false);
      }
    };

    fetchPendingConsentsCount();
  }, [user?.uuid, showTosWidget]);

  if (!user) {
    return null;
  }

  const hasActiveInvitations = invitationsCount > 0;
  const hasEscalatedVerifications = escalatedVerificationsCount > 0;
  const hasResources = resourcesCount > 0;
  const hasPendingConsents = pendingConsentsCount > 0;

  const openActiveInvitations = () => {
    dispatch(
      openModalDialog(ActiveInvitationsDialog, {
        size: 'lg',
        resolve: { user },
      }),
    );
  };

  const goToOnboardingApplications = () => {
    router.stateService.go('profile.onboarding-applications');
  };

  const goToTosManagement = () => {
    router.stateService.go('profile.tos-management');
  };

  const openResourcesDialog = () => {
    dispatch(openModalDialog(UserResourcesDialog, { resolve: {}, size: 'lg' }));
  };

  const showDashboardWidgets = isExperimentalUiComponentsVisible();

  // Resources widget shows independently (always visible when user has resources)
  const showOtherWidgets =
    showDashboardWidgets &&
    (hasActiveInvitations ||
      (showOnboardingWidgets && hasEscalatedVerifications) ||
      (showTosWidget && hasPendingConsents));

  return (
    <>
      {(hasResources || showOtherWidgets) && (
        <Row className="mb-5 gy-4">
          {hasResources && (
            <Col md={4}>
              <DashboardCard
                title={translate('Your resources')}
                message={translate(
                  'You have access to {count} resources. Click to learn how to get started.',
                  { count: resourcesCount },
                )}
                icon={
                  <RocketLaunchIcon size={32} color="white" weight="bold" />
                }
                isLoading={false}
                hasItems={true}
                backgroundColor="bg-info"
                onClick={openResourcesDialog}
              />
            </Col>
          )}
          {showDashboardWidgets && hasActiveInvitations && (
            <Col md={4}>
              <DashboardCard
                title={translate('Pending invitations')}
                message={translate(
                  'See pending invites sent to your email {email} ({count})',
                  { email: user.email, count: invitationsCount },
                )}
                icon={<SignInIcon size={32} color="white" weight="bold" />}
                isLoading={false}
                hasItems={true}
                backgroundColor="bg-success"
                onClick={openActiveInvitations}
              />
            </Col>
          )}
          {showDashboardWidgets &&
            showOnboardingWidgets &&
            hasEscalatedVerifications && (
              <Col md={4}>
                <DashboardCard
                  title={translate('Pending onboarding applications')}
                  message={translate(
                    'You have {count} pending organization onboarding application(s)',
                    { count: escalatedVerificationsCount },
                  )}
                  icon={<BuildingsIcon size={32} color="white" weight="bold" />}
                  isLoading={false}
                  hasItems={true}
                  backgroundColor="bg-warning"
                  onClick={goToOnboardingApplications}
                />
              </Col>
            )}
          {showTosWidget && hasPendingConsents && (
            <Col md={4}>
              <DashboardCard
                title={translate('Pending terms of service')}
                message={translate(
                  'You have {count} offering(s) with unaccepted terms of service',
                  { count: pendingConsentsCount },
                )}
                icon={<CertificateIcon size={32} color="white" weight="bold" />}
                isLoading={false}
                hasItems={true}
                backgroundColor="bg-danger"
                onClick={goToTosManagement}
              />
            </Col>
          )}
        </Row>
      )}

      {isFeatureVisible(UserFeatures.pending_user_actions) && (
        <div className="mb-5">
          <UserPendingActionsList user={user} />
        </div>
      )}

      <div className="mt-5">
        <UserAffiliationsList user={user} />
      </div>
    </>
  );
};
