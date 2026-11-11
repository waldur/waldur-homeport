import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import {
  ReviewerProfile,
  reviewerProfilesPublish,
  reviewerProfilesUnpublish,
} from 'waldur-js-client';

import {
  Badge,
  BaseButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardHeader,
} from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { ReviewerProfileAddDropdown } from './ReviewerProfileAddDropdown';
import {
  publicationRequiresApproval,
  reviewerProfilesEnabled,
} from './reviewerSettings';
import {
  isInGoodStanding,
  ReviewerStandingBadge,
} from './ReviewerStandingBadge';

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

  const publicationPending =
    !profile.is_published && profile.publication_request?.state === 'pending';
  const publicationRejected =
    !profile.is_published && profile.publication_request?.state === 'rejected';

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
      const { data } = await reviewerProfilesPublish();
      showSuccess(
        data?.publication_pending
          ? translate(
              'Publication requested. Your profile becomes discoverable once the platform operator approves it.',
            )
          : translate(
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
    <Tabs value={activeTab} onValueChange={(key) => onTabChange(key as TabKey)}>
      <Card bordered>
        <CardHeader className="pt-3">
          <div className="flex flex-col lg:flex-row w-full gap-3">
            {/* Left side: Title, refresh, and status badges */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1.5">
                <h3 className="mb-0">{translate('Reviewer profile')}</h3>
                {profile.is_published ? (
                  <Badge variant="success" tone="outline">
                    {translate('Published')}
                  </Badge>
                ) : publicationPending ? (
                  <Badge variant="warning" tone="outline">
                    {translate('Awaiting approval')}
                  </Badge>
                ) : (
                  <Badge variant="neutral" tone="outline">
                    {translate('Not published')}
                  </Badge>
                )}
                <ReviewerStandingBadge standing={profile.standing} />
                <BaseButton
                  tooltip={translate('Refresh')}
                  variant="text-secondary"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  disabledReason={translate('Refreshing...')}
                  iconNode={
                    <ArrowsClockwiseIcon
                      size={16}
                      weight="bold"
                      className={isRefreshing ? 'animation-spin' : ''}
                    />
                  }
                />
              </div>
              {profile.is_published && profile.published_at && (
                <span className="text-quaternary font-normal text-xs">
                  {translate('Published {date}', {
                    date: formatDateTime(profile.published_at),
                  })}
                </span>
              )}
              {publicationPending && (
                <span className="text-quaternary font-normal text-xs">
                  {translate(
                    'The platform operator reviews new profiles before call managers can find them.',
                  )}
                </span>
              )}
              {publicationRejected && (
                <span className="text-danger font-normal text-xs">
                  {profile.publication_request?.review_comment
                    ? translate('Publication declined: {comment}', {
                        comment: profile.publication_request.review_comment,
                      })
                    : translate(
                        'Publication declined by the platform operator.',
                      )}
                </span>
              )}
              {!isInGoodStanding(profile.standing) && (
                <span className="text-danger font-normal text-xs">
                  {translate(
                    'You are not offered new review work at the moment. Contact the platform operator for details.',
                  )}
                </span>
              )}
            </div>

            {/* Right side: Controls */}
            <div className="flex flex-wrap items-center gap-2.5 lg:ms-auto">
              <ReviewerProfileAddDropdown profile={profile} />
              {profile.is_published ? (
                <BaseButton
                  variant="danger"
                  onClick={handleUnpublish}
                  pending={isPublishing}
                  label={translate('Unpublish profile')}
                  size="lg"
                />
              ) : publicationPending ? (
                <BaseButton
                  variant="secondary"
                  onClick={handleUnpublish}
                  pending={isPublishing}
                  label={translate('Withdraw request')}
                  size="lg"
                />
              ) : reviewerProfilesEnabled() ? (
                <BaseButton
                  variant="primary"
                  onClick={handlePublish}
                  pending={isPublishing}
                  label={
                    publicationRequiresApproval()
                      ? translate('Request publication')
                      : translate('Publish profile')
                  }
                  size="lg"
                />
              ) : null}
            </div>
          </div>
        </CardHeader>
        {/* Tabs navigation */}
        <CardHeader className="border-b border-b-secondary items-stretch py-0 min-h-auto">
          <TabsList scrollable scrollClassName="grow pt-3" bordered={false}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardHeader>
        <CardContent className={activeTab === 'info' ? 'pt-3' : 'pt-0 pb-0'}>
          <TabsContent value={activeTab}>{children}</TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
};
