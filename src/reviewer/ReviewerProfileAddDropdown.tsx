import {
  BriefcaseIcon,
  CaretDownIcon,
  FileTextIcon,
  LightbulbIcon,
  PlusCircleIcon,
} from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { Dropdown } from 'react-bootstrap';
import { ReviewerProfile } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const AffiliationFormDialog = lazyComponent(() =>
  import('./AffiliationFormDialog').then((module) => ({
    default: module.AffiliationFormDialog,
  })),
);

const ExpertiseFormDialog = lazyComponent(() =>
  import('./ExpertiseFormDialog').then((module) => ({
    default: module.ExpertiseFormDialog,
  })),
);

const PublicationFormDialog = lazyComponent(() =>
  import('./PublicationFormDialog').then((module) => ({
    default: module.PublicationFormDialog,
  })),
);

interface ReviewerProfileAddDropdownProps {
  profile: ReviewerProfile;
}

export const ReviewerProfileAddDropdown = ({
  profile,
}: ReviewerProfileAddDropdownProps) => {
  const { openDialog } = useModal();
  const queryClient = useQueryClient();

  const handleAddAffiliation = () => {
    openDialog(AffiliationFormDialog, {
      resolve: {
        profile,
        refetch: () =>
          queryClient.invalidateQueries({
            queryKey: ['reviewerAffiliationsList'],
          }),
      },
      size: 'sm',
    });
  };

  const handleAddExpertise = () => {
    openDialog(ExpertiseFormDialog, {
      resolve: {
        profile,
        refetch: () =>
          queryClient.invalidateQueries({
            queryKey: ['reviewerExpertiseList'],
          }),
      },
      size: 'sm',
    });
  };

  const handleAddPublication = () => {
    openDialog(PublicationFormDialog, {
      resolve: {
        profile,
        refetch: () =>
          queryClient.invalidateQueries({
            queryKey: ['reviewerPublicationsList'],
          }),
      },
      size: 'sm',
    });
  };

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
        <ActionItem
          title={translate('Affiliation')}
          action={handleAddAffiliation}
          iconNode={<BriefcaseIcon weight="bold" />}
        />
        <ActionItem
          title={translate('Expertise')}
          action={handleAddExpertise}
          iconNode={<LightbulbIcon weight="bold" />}
        />
        <ActionItem
          title={translate('Publication')}
          action={handleAddPublication}
          iconNode={<FileTextIcon weight="bold" />}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
};
