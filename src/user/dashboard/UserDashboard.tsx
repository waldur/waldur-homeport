import { SignInIcon } from '@phosphor-icons/react';
import { FC, useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { userInvitationsList } from 'waldur-js-client';

import { fetchResultCount } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { useUser } from '@waldur/workspace/hooks';

import { UserAffiliationsList } from '../affiliations/UserAffiliationsList';

import { ActiveInvitationsList } from './ActiveInvitationsList';

export const UserDashboard: FC = () => {
  const user = useUser();
  const [invitationsCount, setInvitationsCount] = useState<number>(0);
  const [isLoadingInvitations, setIsLoadingInvitations] =
    useState<boolean>(true);

  if (!user) {
    return null;
  }

  useEffect(() => {
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
  }, [user.email]);

  const hasActiveInvitations = invitationsCount > 0;

  const scrollToActiveInvitations = () => {
    const element = document.getElementById('active-invitations-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const showDashboardWidgets = isExperimentalUiComponentsVisible();

  return (
    <>
      {showDashboardWidgets && (
        <Row className="mb-5">
          <Col md={4}>
            <Card
              className={`card-bordered ${
                !isLoadingInvitations && hasActiveInvitations
                  ? 'card-hover cursor-pointer'
                  : 'opacity-50'
              }`}
              onClick={
                !isLoadingInvitations && hasActiveInvitations
                  ? scrollToActiveInvitations
                  : undefined
              }
              style={{
                cursor:
                  !isLoadingInvitations && hasActiveInvitations
                    ? 'pointer'
                    : 'default',
              }}
            >
              <Card.Body className="d-flex align-items-center">
                <div className="symbol symbol-50px me-4">
                  <div
                    className={`symbol-label ${!isLoadingInvitations && hasActiveInvitations ? 'bg-success' : 'bg-gray-300'}`}
                  >
                    <SignInIcon size={32} color="white" weight="bold" />
                  </div>
                </div>
                <div>
                  <Card.Title className="mb-1 h5">
                    {translate('Active invitations')}
                  </Card.Title>
                  <p className="text-muted mb-0 fs-7">
                    {isLoadingInvitations
                      ? translate('Loading...')
                      : hasActiveInvitations
                        ? translate(
                            'See pending invites sent to your email {email} ({count})',
                            { email: user.email, count: invitationsCount },
                          )
                        : translate('No active invitations at the moment')}
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
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
