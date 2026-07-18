import { ArrowRightIcon, UserIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { reviewerProfilesMeRetrieve } from 'waldur-js-client';

import Avatar from '@/core/Avatar';
import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { OrcidLogo } from '@/core/OrcidLogo';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { router } from '@/router';
import { useUser } from '@/workspace/hooks';

interface ReviewerProfileSummaryCardProps {
  onProfileStatus?: (hasProfile: boolean) => void;
}

export const ReviewerProfileSummaryCard: FC<
  ReviewerProfileSummaryCardProps
> = ({ onProfileStatus }) => {
  const currentUser = useUser();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['reviewer-profile-me-summary'],
    queryFn: async () => {
      try {
        const response = await reviewerProfilesMeRetrieve();
        const profileData = response.data;
        onProfileStatus?.(true);
        return profileData;
      } catch (error) {
        // Return null if profile doesn't exist (404)
        if ((error as any)?.response?.status === 404) {
          onProfileStatus?.(false);
          return null;
        }
        throw error;
      }
    },
    enabled: !!currentUser,
  });

  const handleManageProfile = () => {
    router.stateService.go('profile-manage', { tab: 'reviewer-profile' });
  };

  if (isLoading) {
    return (
      <Card className="card-bordered">
        <Card.Body className="d-flex align-items-center justify-content-center py-6">
          <LoadingSpinner />
        </Card.Body>
      </Card>
    );
  }

  // No profile exists - show create prompt
  if (!profile) {
    return (
      <Card className="card-bordered bg-light-warning">
        <Card.Body>
          <div className="d-flex align-items-center gap-4">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-warning text-white"
              style={{ width: 56, height: 56, minWidth: 56 }}
            >
              <UserIcon size={28} weight="regular" />
            </div>
            <div className="flex-grow-1">
              <h4 className="mb-1">{translate('Reviewer profile required')}</h4>
              <p className="text-muted mb-0">
                {translate(
                  'To receive review invitations and participate in proposal reviews, you need to create and publish your reviewer profile.',
                )}
              </p>
            </div>
            <SubmitButton
              type="button"
              variant="warning"
              onClick={handleManageProfile}
              submitting={false}
              label={translate('Create profile')}
              iconNode={<ArrowRightIcon weight="bold" />}
            />
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="card-bordered">
      <Card.Body>
        <div className="d-flex align-items-center gap-4">
          {/* Avatar */}
          <Avatar
            src={currentUser?.image}
            name={currentUser?.full_name || currentUser?.username || ''}
            size={56}
            circle
          />

          {/* Profile info */}
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h4 className="mb-0">{currentUser?.full_name}</h4>
              {profile.is_published ? (
                <Badge variant="success" outline>
                  {translate('Published')}
                </Badge>
              ) : (
                <Badge variant="warning" outline>
                  {translate('Not published')}
                </Badge>
              )}
            </div>

            <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
              {profile.orcid_id && (
                <a
                  href={`https://orcid.org/${profile.orcid_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-inline-flex align-items-center gap-1 text-decoration-none"
                >
                  <OrcidLogo size={14} />
                  {profile.orcid_id}
                </a>
              )}
              {profile.is_published && profile.published_at && (
                <span>
                  {translate('Published {date}', {
                    date: formatDateTime(profile.published_at),
                  })}
                </span>
              )}
              {profile.stats?.total_reviews_completed > 0 && (
                <span>
                  {translate('{count} reviews completed', {
                    count: profile.stats.total_reviews_completed,
                  })}
                </span>
              )}
            </div>

            {!profile.is_published && (
              <p className="text-warning mb-0 mt-2 small">
                {translate(
                  'Your profile is not published. Publish it to appear in reviewer searches and receive invitations.',
                )}
              </p>
            )}
          </div>

          {/* Action */}
          <SubmitButton
            type="button"
            variant="light-primary"
            onClick={handleManageProfile}
            submitting={false}
            label={translate('Manage profile')}
            iconNode={<ArrowRightIcon weight="bold" />}
          />
        </div>
      </Card.Body>
    </Card>
  );
};
