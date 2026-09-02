import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { ReviewerProfile } from 'waldur-js-client';

import { AddDropdownToggle } from '@/table/ActionsDropdown';

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
    <RadixDropdownMenu.Root modal={false}>
      <RadixDropdownMenu.Trigger asChild>
        <AddDropdownToggle size="lg" />
      </RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align="start"
          sideOffset={2}
          className="dropdown-menu show position-static"
        >
          <AddAffiliationAction profile={profile} />
          <AddExpertiseAction profile={profile} />
          <AddPublicationAction profile={profile} />
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};
