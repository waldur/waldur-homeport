import { BriefcaseIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
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

interface AddAffiliationActionProps {
  profile: ReviewerProfile;
}

export const AddAffiliationAction = ({
  profile,
}: AddAffiliationActionProps) => {
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

  return (
    <ActionItem
      title={translate('Affiliation')}
      action={handleAddAffiliation}
      iconNode={<BriefcaseIcon weight="bold" />}
    />
  );
};
