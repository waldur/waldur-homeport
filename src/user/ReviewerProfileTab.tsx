import { FC, useState } from 'react';
import { Card } from 'react-bootstrap';
import { ReviewerProfile } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { AffiliationsSection } from '@waldur/reviewer/AffiliationsSection';
import { ExpertiseSection } from '@waldur/reviewer/ExpertiseSection';
import { ProfileInfoSection } from '@waldur/reviewer/ProfileInfoSection';
import { PublicationsSection } from '@waldur/reviewer/PublicationsSection';
import { ReviewerProfilePanel } from '@waldur/reviewer/ReviewerProfilePanel';
import { useReviewerProfile } from '@waldur/reviewer/useReviewerProfile';

interface ReviewerProfileTabProps {
  user: any;
}

type TabKey = 'info' | 'affiliations' | 'expertise' | 'publications';

const CreateProfilePrompt: FC<{
  onCreate: () => void;
  isCreating: boolean;
}> = ({ onCreate, isCreating }) => (
  <Card className="card-bordered">
    <Card.Body className="text-center py-10">
      <h3 className="mb-5">
        {translate('You do not have a reviewer profile yet.')}
      </h3>
      <p className="text-muted mb-5">
        {translate(
          'Create a reviewer profile to manage your affiliations, expertise, and publications for proposal reviews.',
        )}
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onCreate}
        disabled={isCreating}
      >
        {isCreating
          ? translate('Creating...')
          : translate('Create reviewer profile')}
      </button>
    </Card.Body>
  </Card>
);

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
  const {
    profile,
    isLoading,
    error,
    refetch,
    createProfile,
    isCreating,
    updateProfile,
    isUpdating,
  } = useReviewerProfile();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error && (error as any).response?.status !== 404) {
    return <h3>{translate('Unable to load reviewer profile.')}</h3>;
  }

  if (!profile) {
    return (
      <CreateProfilePrompt onCreate={createProfile} isCreating={isCreating} />
    );
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
