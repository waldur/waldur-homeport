import { CheckCircleIcon, InfoIcon, XCircleIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useCallback } from 'react';
import { Card, Container } from 'react-bootstrap';
import {
  reviewerInvitationsRetrieve,
  reviewerInvitationsAccept,
  reviewerInvitationsDecline,
  reviewerProfilesMeRetrieve,
  reviewerProfilesPublish,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { DEFAULT_REDIRECT_STATE } from '@/auth/authNavigation';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useTitle } from '@/navigation/title';
import { router } from '@/router';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { COIPolicyCard, hasCOIPolicy } from './COIPolicyCard';
import { InvitationDetailsCard } from './InvitationDetailsCard';
import { InvitationFAQCard } from './InvitationFAQCard';
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
  const user = useUser();
  const { showSuccess, showErrorResponse } = useNotify();
  const { confirm } = useModal();

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
      router.stateService.go('profile-manage', { tab: 'reviewer-profile' });
    },
    onError: (error) => {
      showErrorResponse(error, translate('Unable to accept invitation.'));
    },
  });

  // Decline mutation
  const declineMutation = useMutation({
    mutationFn: (reason: string) => declineInvitation(token, reason),
    onSuccess: () => {
      showSuccess(translate('Invitation declined.'));
      router.stateService.go(DEFAULT_REDIRECT_STATE);
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

  const handleDecline = async () => {
    let result: { input?: string };
    try {
      result = await confirm(
        translate('Decline invitation'),
        translate(
          'You will not join the reviewer pool for this call. This cannot be undone from this page.',
        ),
        {
          type: 'danger',
          positiveButton: translate('Decline'),
          negativeButton: translate('Cancel'),
          positiveButtonVariant: 'danger',
          showInput: true,
          inputLabel: translate('Reason'),
          inputPlaceholder: translate('Optional'),
          inputRequired: false,
        },
      );
    } catch {
      return;
    }
    declineMutation.mutate(result?.input?.trim() || translate('User declined'));
  };

  if (invitationLoading || profileLoading) {
    return <LoadingSpinner />;
  }

  if (invitationError) {
    return (
      <Container fluid className="py-10">
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

  // CheckIcon if invitation is already processed
  if (invitation.invitation_status !== 'pending') {
    return (
      <Container fluid className="py-10">
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
  const acceptBlockedReason = invitation.is_expired
    ? translate(
        'This invitation has expired. Please contact the call manager for a new invitation.',
      )
    : !canAccept
      ? translate(
          'Please create and publish your reviewer profile before accepting the invitation.',
        )
      : undefined;

  return (
    <Container fluid className="py-10">
      <div className="mb-6">
        <h1 className="fs-2 fw-semibold mb-1">
          {translate('You have been invited to review')}
        </h1>
        <p className="text-muted mb-0">
          {translate(
            'Review and respond to the invitation below. Your decision helps the call manager build a balanced reviewer pool.',
          )}
        </p>
      </div>

      {/* Profile gating message */}
      <ProfileRequiredMessage
        hasProfile={profileStatus?.has_profile ?? false}
        isPublished={profileStatus?.is_published ?? false}
        onPublish={handlePublish}
        isPublishing={publishMutation.isPending}
      />

      <InvitationDetailsCard invitation={invitation} />

      {/* Two-stage workflow explanation */}
      <TwoStageWorkflowCard />

      <InvitationFAQCard />

      {/* COI Policy (informational - disclosure happens at assignment stage) */}
      <COIPolicyCard config={invitation.coi_configuration} />

      <div className="position-sticky bottom-0 z-index-2 d-flex flex-wrap flex-md-nowrap align-items-center justify-content-between gap-4 border rounded bg-body px-6 py-4">
        <div className="d-none d-md-flex align-items-center gap-2 flex-fill text-muted">
          {hasCOIPolicy(invitation.coi_configuration) && (
            <>
              <InfoIcon size={18} weight="bold" className="flex-shrink-0" />
              {translate(
                'When you are assigned specific proposals to review, you will have the opportunity to disclose any conflicts of interest at that time.',
              )}
            </>
          )}
        </div>
        <div className="d-flex gap-3 ms-auto flex-shrink-0">
          <BaseButton
            variant="success"
            onClick={() => acceptMutation.mutate()}
            disabled={Boolean(acceptBlockedReason) || declineMutation.isPending}
            disabledReason={
              acceptBlockedReason ??
              (declineMutation.isPending
                ? translate('The invitation is being declined.')
                : undefined)
            }
            pending={acceptMutation.isPending}
            label={translate('Accept')}
            iconNode={<CheckCircleIcon weight="bold" />}
          />
          <BaseButton
            variant="danger"
            onClick={handleDecline}
            disabled={acceptMutation.isPending}
            disabledReason={
              acceptMutation.isPending
                ? translate('The invitation is being accepted.')
                : undefined
            }
            pending={declineMutation.isPending}
            label={translate('Decline')}
            iconNode={<XCircleIcon weight="bold" />}
          />
        </div>
      </div>
    </Container>
  );
};
