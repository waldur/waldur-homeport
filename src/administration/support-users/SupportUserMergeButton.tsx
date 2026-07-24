import { GitMergeIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const SupportUserMergeDialog = lazyComponent(() =>
  import('./SupportUserMergeDialog').then((module) => ({
    default: module.SupportUserMergeDialog,
  })),
);

export const SupportUserMergeButton = ({ row, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Merge duplicates')}
      iconNode={<GitMergeIcon weight="bold" />}
      action={() =>
        openDialog(SupportUserMergeDialog, {
          resolve: { keeper: row, refetch },
        })
      }
    />
  );
};
