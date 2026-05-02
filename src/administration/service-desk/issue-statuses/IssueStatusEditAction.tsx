import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { IssueStatusAdmin } from './api';

const IssueStatusFormDialog = lazyComponent(() =>
  import('./IssueStatusForm').then((module) => ({
    default: module.IssueStatusForm,
  })),
);

export const IssueStatusEditAction = ({
  row,
  refetch,
}: {
  row: IssueStatusAdmin;
  refetch: () => void;
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={() =>
        openDialog(IssueStatusFormDialog, {
          size: 'sm',
          resolve: { issueStatus: row, refetch },
        })
      }
    />
  );
};
