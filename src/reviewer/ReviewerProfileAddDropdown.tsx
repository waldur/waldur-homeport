import { CaretDownIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { ReviewerProfile } from 'waldur-js-client';

import { translate } from '@/i18n';

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
    <Dropdown placement="bottom-end">
      <Dropdown.Toggle
        variant="primary"
        size="lg"
        className="no-arrow btn-icon-right"
      >
        <span className="svg-icon svg-icon-2">
          <PlusCircleIcon weight="bold" />
        </span>
        {translate('Add')}
        <span className="svg-icon svg-icon-2 rotate-180">
          <CaretDownIcon weight="bold" />
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu flip>
        <AddAffiliationAction profile={profile} />
        <AddExpertiseAction profile={profile} />
        <AddPublicationAction profile={profile} />
      </Dropdown.Menu>
    </Dropdown>
  );
};
