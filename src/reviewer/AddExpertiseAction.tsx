import { LightbulbIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { ReviewerProfile } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const ExpertiseFormDialog = lazyComponent(() =>
  import('./ExpertiseFormDialog').then((module) => ({
    default: module.ExpertiseFormDialog,
  })),
);

interface AddExpertiseActionProps {
  profile: ReviewerProfile;
}

export const AddExpertiseAction = ({ profile }: AddExpertiseActionProps) => {
  const { openDialog } = useModal();
  const queryClient = useQueryClient();

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

  return (
    <ActionItem
      title={translate('Expertise')}
      action={handleAddExpertise}
      iconNode={<LightbulbIcon weight="bold" />}
    />
  );
};
