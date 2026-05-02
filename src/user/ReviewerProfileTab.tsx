import { FC, useState } from 'react';
import { ReviewerProfile } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { AffiliationsSection } from '@/reviewer/AffiliationsSection';
import { CreateProfilePrompt } from '@/reviewer/CreateProfilePrompt';
import { ExpertiseSection } from '@/reviewer/ExpertiseSection';
import { ProfileInfoSection } from '@/reviewer/ProfileInfoSection';
import { PublicationsSection } from '@/reviewer/PublicationsSection';
import { ReviewerProfilePanel } from '@/reviewer/ReviewerProfilePanel';
import { useReviewerProfile } from '@/reviewer/useReviewerProfile';
import { useUpdateReviewerProfile } from '@/reviewer/useUpdateReviewerProfile';

interface ReviewerProfileTabProps {
  user: any;
}

type TabKey = 'info' | 'affiliations' | 'expertise' | 'publications';

interface ProfileContentProps {
  profile: ReviewerProfile;
  updateProfile: (data: Partial<ReviewerProfile>) => void;
  isUpdating: boolean;
  refetch: () => void;
}

const ProfileContent: FC<ProfileContentProps> = ({
  profile,
  updateProfile,
  isUpdating,
  refetch,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('info');

  const sectionProps = {
    profile,
    updateProfile,
    isUpdating,
    refetch,
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <ProfileInfoSection {...sectionProps} />;
      case 'affiliations':
        return <AffiliationsSection {...sectionProps} />;
      case 'expertise':
        return <ExpertiseSection {...sectionProps} />;
      case 'publications':
        return <PublicationsSection {...sectionProps} />;
      default:
        return null;
    }
  };

  return (
    <ReviewerProfilePanel
      profile={profile}
      refetch={refetch}
      updateProfile={updateProfile}
      isUpdating={isUpdating}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
    </ReviewerProfilePanel>
  );
};

export const ReviewerProfileTab: FC<ReviewerProfileTabProps> = () => {
  const { profile, isLoading, error, refetch } = useReviewerProfile();
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateReviewerProfile();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error && (error as any).response?.status !== 404) {
    return <h3>{translate('Unable to load reviewer profile.')}</h3>;
  }

  if (!profile) {
    return <CreateProfilePrompt />;
  }

  return (
    <ProfileContent
      profile={profile}
      updateProfile={updateProfile}
      isUpdating={isUpdating}
      refetch={refetch}
    />
  );
};
