import { Check, X } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useCallback } from 'react';
import { Card, Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  reviewerInvitationsRetrieve,
  reviewerInvitationsAccept,
  reviewerInvitationsDecline,
  reviewerProfilesMeRetrieve,
  reviewerProfilesPublish,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { router } from '@waldur/router';
import { useNotify } from '@waldur/store/hooks';
import { getUser } from '@waldur/workspace/selectors';

import { COIPolicyCard } from './COIPolicyCard';
import { ProfileRequiredMessage } from './ProfileRequiredMessage';
import { TwoStageWorkflowCard } from './TwoStageWorkflowCard';

interface ProfileStatus {
  has_profile: boolean;
  is_published: boolean;
  profile_uuid?: string;
}

const fetchInvitationDetails = async (token: string) => {
  const response = await reviewerInvitationsRetrieve({ path: { token } });
  return response.data;
};

const fetchProfileStatus = async (): Promise<ProfileStatus> => {
  try {
    const response = await reviewerProfilesMeRetrieve({});
    const profile = response.data;
    return {
      has_profile: true,
      is_published: profile?.is_published ?? false,
      profile_uuid: profile?.uuid,
    };
  } catch (error) {
    // 404 means no profile exists
    if (error.response?.status === 404) {
      return {
        has_profile: false,
        is_published: false,
      };
    }
    throw error;
  }
};

const acceptInvitation = async (token: string) => {
  // Note: COI disclosure now happens at the assignment stage (Stage 2),
  // not at pool invitation acceptance (Stage 1)
  const response = await reviewerInvitationsAccept({
    path: { token },
    body: {},
  });
  return response.data;
};

const declineInvitation = async (token: string, reason: string) => {
  const response = await reviewerInvitationsDecline({
    path: { token },
    body: { reason },
  });
  return response.data;
};

const publishProfile = async () => {
  const response = await reviewerProfilesPublish({});
  return response.data;
};

export const ReviewerInvitationAccept: FC = () => {
  const {
    params: { token },
  } = useCurrentStateAndParams();
  const user = useSelector(getUser);
  const { showSuccess, showErrorResponse } = useNotify();

  useTitle(translate('Reviewer invitation'));

  // Fetch invitation details
  const {
    data: invitation,
    isLoading: invitationLoading,
    error: invitationError,
  } = useQuery({
    queryKey: ['reviewerInvitation', token],
    queryFn: () => fetchInvitationDetails(token),
    enabled: !!token,
  });

  // Fetch profile status
  const {
    data: profileStatus,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['reviewerProfileStatus'],
    queryFn: fetchProfileStatus,
    enabled: !!user,
  });

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: () => acceptInvitation(token),
    onSuccess: () => {
      showSuccess(translate('Invitation accepted successfully.'));
      router.stateService.go('profile.reviewer');
    },
    onError: (error) => {
      showErrorResponse(error, translate('Unable to accept invitation.'));
    },
  });

  // Decline mutation
  const declineMutation = useMutation({
    mutationFn: () => declineInvitation(token, translate('User declined')),
    onSuccess: () => {
      showSuccess(translate('Invitation declined.'));
      router.stateService.go('profile');
    },
    onError: (error) => {
      showErrorResponse(error, translate('Unable to decline invitation.'));
    },
  });

  // Publish profile mutation
  const publishMutation = useMutation({
    mutationFn: publishProfile,
    onSuccess: () => {
      showSuccess(translate('Profile published successfully.'));
      refetchProfile();
    },
    onError: (error) => {
      showErrorResponse(error, translate('Unable to publish profile.'));
    },
  });

  const handlePublish = useCallback(() => {
    publishMutation.mutate();
  }, [publishMutation]);

  if (invitationLoading || profileLoading) {
    return <LoadingSpinner />;
  }

  if (invitationError) {
    return (
      <Container className="py-10">
        <Card className="card-bordered">
          <Card.Body className="text-center py-10">
            <h3 className="text-danger mb-4">
              {translate('Invalid invitation')}
            </h3>
            <p className="text-muted">
              {translate(
                'This invitation link is invalid or has expired. Please contact the call manager for a new invitation.',
              )}
            </p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (!invitation) {
    return null;
  }

  // Check if invitation is already processed
  if (invitation.invitation_status !== 'pending') {
    return (
      <Container className="py-10">
        <Card className="card-bordered">
          <Card.Body className="text-center py-10">
            <h3 className="mb-4">
              {translate('Invitation already processed')}
            </h3>
            <p className="text-muted">
              {invitation.invitation_status === 'accepted'
                ? translate('You have already accepted this invitation.')
                : translate('This invitation has been declined or expired.')}
            </p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const canAccept = profileStatus?.has_profile && profileStatus?.is_published;

  return (
    <Container className="py-10">
      <h2 className="mb-6">{translate('Reviewer invitation')}</h2>

      {/* Profile gating message */}
      <ProfileRequiredMessage
        hasProfile={profileStatus?.has_profile ?? false}
        isPublished={profileStatus?.is_published ?? false}
        onPublish={handlePublish}
        isPublishing={publishMutation.isPending}
      />

      {/* Invitation details */}
      <Card className="card-bordered mb-6">
        <Card.Header>
          <Card.Title>
            <h3>{translate('Invitation details')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-column gap-4">
            <div>
              <div className="fw-bold text-muted mb-1">{translate('Call')}</div>
              <div className="fs-4">{invitation.call_name}</div>
            </div>
            {invitation.invited_by_name && (
              <div>
                <div className="fw-bold text-muted mb-1">
                  {translate('Invited by')}
                </div>
                <div>{invitation.invited_by_name}</div>
              </div>
            )}
            {invitation.expires_at && (
              <div>
                <div className="fw-bold text-muted mb-1">
                  {translate('Expires')}
                </div>
                <div>
                  {new Date(invitation.expires_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Two-stage workflow explanation */}
      <TwoStageWorkflowCard />

      {/* COI Policy (informational - disclosure happens at assignment stage) */}
      <COIPolicyCard config={invitation.coi_configuration} />

      {invitation.coi_configuration && (
        <Card className="card-bordered mb-6 bg-light-info">
          <Card.Body>
            <p className="mb-0 text-info">
              <strong>{translate('Note')}:</strong>{' '}
              {translate(
                'When you are assigned specific proposals to review, you will have the opportunity to disclose any conflicts of interest at that time.',
              )}
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Actions */}
      <div className="d-flex gap-4 justify-content-center">
        <SubmitButton
          type="button"
          variant="success"
          onClick={() => acceptMutation.mutate()}
          disabled={!canAccept || declineMutation.isPending}
          submitting={acceptMutation.isPending}
          label={translate('Accept invitation')}
          iconNode={<Check weight="bold" />}
          iconOnLeft
        />
        <SubmitButton
          type="button"
          variant="danger"
          onClick={() => declineMutation.mutate()}
          disabled={acceptMutation.isPending}
          submitting={declineMutation.isPending}
          label={translate('Decline invitation')}
          iconNode={<X weight="bold" />}
          iconOnLeft
        />
      </div>
      {!canAccept && (
        <p className="text-center text-muted mt-4">
          {translate(
            'Please create and publish your reviewer profile before accepting the invitation.',
          )}
        </p>
      )}
    </Container>
  );
};
