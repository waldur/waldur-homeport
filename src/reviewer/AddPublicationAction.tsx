import { FileTextIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { ReviewerProfile } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const PublicationFormDialog = lazyComponent(() =>
  import('./PublicationFormDialog').then((module) => ({
    default: module.PublicationFormDialog,
  })),
);

interface AddPublicationActionProps {
  profile: ReviewerProfile;
}

export const AddPublicationAction = ({
  profile,
}: AddPublicationActionProps) => {
  const { openDialog } = useModal();
  const queryClient = useQueryClient();

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
    <ActionItem
      title={translate('Publication')}
      action={handleAddPublication}
      iconNode={<FileTextIcon weight="bold" />}
    />
  );
};
