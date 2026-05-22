import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Card, Nav } from 'react-bootstrap';
import {
  ReviewerProfile,
  reviewerProfilesPublish,
  reviewerProfilesUnpublish,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { ReviewerProfileAddDropdown } from './ReviewerProfileAddDropdown';

type TabKey = 'info' | 'affiliations' | 'expertise' | 'publications';

interface ReviewerProfilePanelProps {
  profile: ReviewerProfile;
  refetch?: () => void;
  updateProfile: (data: Partial<ReviewerProfile>) => void;
  isUpdating: boolean;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  children: React.ReactNode;
}

const TAB_QUERY_KEYS: Record<TabKey, string> = {
  info: 'reviewer-profile-me',
  affiliations: 'reviewerAffiliationsList',
  expertise: 'reviewerExpertiseList',
  publications: 'reviewerPublicationsList',
};

export const ReviewerProfilePanel = ({
  profile,
  refetch,
  activeTab,
  onTabChange,
  children,
}: ReviewerProfilePanelProps) => {
  const { confirm } = useModal();

  const { showErrorResponse, showSuccess } = useNotify();

  const queryClient = useQueryClient();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: [TAB_QUERY_KEYS[activeTab]],
    });
    setIsRefreshing(false);
  }, [queryClient, activeTab]);

  const handlePublish = useCallback(async () => {
    try {
      await confirm(
        translate('Publish reviewer profile'),
        translate(
          'Publishing your profile will make it visible to call managers who are looking for reviewers. They will be able to see your expertise, affiliations, and publications when searching for potential reviewers. You can unpublish your profile at any time to stop receiving new review invitations.',
        ),
      );
    } catch {
      return;
    }

    setIsPublishing(true);
    try {
      await reviewerProfilesPublish();
      showSuccess(
        translate(
          'Profile published successfully. Your profile is now discoverable by call managers.',
        ),
      );
      refetch?.();
    } catch (error) {
      showErrorResponse(error, translate('Unable to publish profile.'));
    } finally {
      setIsPublishing(false);
    }
  }, [refetch]);

  const handleUnpublish = useCallback(async () => {
    try {
      await confirm(
        translate('Unpublish reviewer profile'),
        translate(
          'Unpublishing your profile will hide it from call managers searching for reviewers. You will no longer appear in reviewer discovery searches and will not receive new review invitations. Your existing review assignments will not be affected.',
        ),
        {
          positiveButton: translate('Unpublish'),
          positiveButtonVariant: 'danger',
        },
      );
    } catch {
      return;
    }

    setIsPublishing(true);
    try {
      await reviewerProfilesUnpublish();
      showSuccess(translate('Profile unpublished successfully.'));
      refetch?.();
    } catch (error) {
      showErrorResponse(error, translate('Unable to unpublish profile.'));
    } finally {
      setIsPublishing(false);
    }
  }, [refetch]);

  const tabs: { key: TabKey; title: string }[] = [
    { key: 'info', title: translate('Profile info') },
    { key: 'affiliations', title: translate('Affiliations') },
    { key: 'expertise', title: translate('Expertise') },
    { key: 'publications', title: translate('Publications') },
  ];

  return (
    <Card className="card-bordered">
      <Card.Header className="border-bottom-0 pt-4">
        <div className="d-flex flex-column flex-lg-row w-100 gap-4">
          {/* Left side: Title, refresh, and status badges */}
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-2 mb-2">
              <h3 className="mb-0">{translate('Reviewer profile')}</h3>
              {profile.is_published ? (
                <Badge variant="success" outline>
                  {translate('Published')}
                </Badge>
              ) : (
                <Badge variant="default" outline>
                  {translate('Not published')}
                </Badge>
              )}
              <button
                type="button"
                className="btn btn-icon btn-sm btn-text-secondary"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <ArrowsClockwiseIcon
                  size={16}
                  weight="bold"
                  className={isRefreshing ? 'animation-spin' : ''}
                />
              </button>
            </div>
            {profile.is_published && profile.published_at && (
              <span className="text-muted fw-normal fs-7">
                {translate('Published {date}', {
                  date: formatDateTime(profile.published_at),
                })}
              </span>
            )}
          </div>

          {/* Right side: Controls */}
          <div className="d-flex flex-wrap align-items-center gap-3 ms-lg-auto">
            <ReviewerProfileAddDropdown profile={profile} />
            {profile.is_published ? (
              <SubmitButton
                type="button"
                variant="danger"
                onClick={handleUnpublish}
                submitting={isPublishing}
                label={translate('Unpublish profile')}
              />
            ) : (
              <SubmitButton
                type="button"
                variant="primary"
                onClick={handlePublish}
                submitting={isPublishing}
                label={translate('Publish profile')}
              />
            )}
          </div>
        </div>
      </Card.Header>
      {/* Tabs navigation */}
      <Card.Header className="border-bottom align-items-stretch py-0 min-h-auto">
        <Nav
          variant="tabs"
          className="nav-line-tabs flex-nowrap mx-0 border-0 pt-4 pb-2"
        >
          {tabs.map((tab) => (
            <Nav.Item key={tab.key}>
              <Nav.Link
                active={activeTab === tab.key}
                onClick={() => onTabChange(tab.key)}
                className="cursor-pointer"
              >
                {tab.title}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </Card.Header>
      <Card.Body className={activeTab === 'info' ? 'pt-4' : 'pt-0 pb-0'}>
        {children}
      </Card.Body>
    </Card>
  );
};
