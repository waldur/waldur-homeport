import { ReviewerProfile } from 'waldur-js-client';

import { ActionsMenu } from '@/table/ActionsDropdown';

import { AddAffiliationAction } from './AddAffiliationAction';
import { AddExpertiseAction } from './AddExpertiseAction';
import { AddPublicationAction } from './AddPublicationAction';

interface ReviewerProfileAddDropdownProps {
  profile: ReviewerProfile;
}

export const ReviewerProfileAddDropdown = ({
  profile,
}: ReviewerProfileAddDropdownProps) => {
  return (
    <ActionsMenu side="bottom" toggle="add" size="lg" align="start">
      <AddAffiliationAction profile={profile} />
      <AddExpertiseAction profile={profile} />
      <AddPublicationAction profile={profile} />
    </ActionsMenu>
  );
};
