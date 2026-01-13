import { SignInIcon, BuildingsIcon } from '@phosphor-icons/react';
import { FC, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  onboardingVerificationsList,
  userInvitationsList,
} from 'waldur-js-client';

import { fetchResultCount } from '@waldur/core/api';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { router } from '@waldur/router';
import { useUser } from '@waldur/workspace/hooks';

import { UserAffiliationsList } from '../affiliations/UserAffiliationsList';

import { ActiveInvitationsList } from './ActiveInvitationsList';
import { DashboardCard } from './DashboardCard';
import { UserPendingActionsList } from './UserPendingActionsList';

export const UserDashboard: FC = () => {
  const user = useUser();
  const [invitationsCount, setInvitationsCount] = useState<number>(0);
  const [isLoadingInvitations, setIsLoadingInvitations] =
    useState<boolean>(true);
  const [escalatedVerificationsCount, setEscalatedVerificationsCount] =
    useState<number>(0);
  const [isLoadingVerifications, setIsLoadingVerifications] =
    useState<boolean>(true);

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
            status: 'escalated',
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

  const scrollToActiveInvitations = () => {
    const element = document.getElementById('active-invitations-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToOnboardingApplications = () => {
    router.stateService.go('profile.onboarding-applications');
  };

  const showDashboardWidgets = isExperimentalUiComponentsVisible();

  return (
    <>
      {showDashboardWidgets && (
        <Row className="mb-5">
          <Col md={4}>
            <DashboardCard
              title={translate('Active invitations')}
              message={
                isLoadingInvitations
                  ? translate('Loading...')
                  : hasActiveInvitations
                    ? translate(
                        'See pending invites sent to your email {email} ({count})',
                        { email: user.email, count: invitationsCount },
                      )
                    : translate('No active invitations at the moment')
              }
              icon={<SignInIcon size={32} color="white" weight="bold" />}
              isLoading={isLoadingInvitations}
              hasItems={hasActiveInvitations}
              backgroundColor="bg-success"
              onClick={scrollToActiveInvitations}
            />
          </Col>
          {showOnboardingWidgets && (
            <Col md={4}>
              <DashboardCard
                title={translate('Pending onboarding applications')}
                message={
                  isLoadingVerifications
                    ? translate('Loading...')
                    : hasEscalatedVerifications
                      ? translate(
                          'You have {count} pending organization onboarding application(s)',
                          { count: escalatedVerificationsCount },
                        )
                      : translate(
                          'No pending onboarding applications at the moment',
                        )
                }
                icon={<BuildingsIcon size={32} color="white" weight="bold" />}
                isLoading={isLoadingVerifications}
                hasItems={hasEscalatedVerifications}
                backgroundColor="bg-warning"
                onClick={goToOnboardingApplications}
              />
            </Col>
          )}
        </Row>
      )}

      {showDashboardWidgets && (
        <div className="mb-5">
          <UserPendingActionsList user={user} />
        </div>
      )}

      {hasActiveInvitations && (
        <div id="active-invitations-section">
          <ActiveInvitationsList user={user} />
        </div>
      )}

      <div className="mt-5">
        <UserAffiliationsList user={user} />
      </div>
    </>
  );
};
