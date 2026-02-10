import {
  SignInIcon,
  BuildingsIcon,
  RocketLaunchIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  marketplaceGlobalCategoriesRetrieve,
  onboardingVerificationsList,
  userInvitationsList,
} from 'waldur-js-client';

import { fetchResultCount } from '@waldur/core/api';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures, UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { openModalDialog } from '@waldur/modal/actions';
import { router } from '@waldur/router';
import { useUser } from '@waldur/workspace/hooks';

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

  useEffect(() => {
    if (!user) return;
    const fetchInvitationsCount = async () => {
      try {
        setIsLoadingInvitations(true);
        const response = await userInvitationsList({
          method: 'HEAD',
          query: {
            email_exact: user.email,
            state: ['pending', 'project'],
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
          method: 'HEAD',
          query: {
            user_uuid: user.uuid,
            status: ['Escalated for manual validation'],
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

  if (!user) {
    return null;
  }

  const hasActiveInvitations = invitationsCount > 0;
  const hasEscalatedVerifications = escalatedVerificationsCount > 0;
  const hasResources = resourcesCount > 0;

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

  const openResourcesDialog = () => {
    dispatch(openModalDialog(UserResourcesDialog, { resolve: {}, size: 'lg' }));
  };

  const showDashboardWidgets = isExperimentalUiComponentsVisible();

  // Resources widget shows independently (always visible when user has resources)
  const showOtherWidgets =
    showDashboardWidgets &&
    (hasActiveInvitations ||
      (showOnboardingWidgets && hasEscalatedVerifications));

  return (
    <>
      {(hasResources || showOtherWidgets) && (
        <Row className="mb-5">
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
