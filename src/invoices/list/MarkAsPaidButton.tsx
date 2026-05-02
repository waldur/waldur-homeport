import { MoneyIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const MarkAsPaidDialog = lazyComponent(() =>
  import('./MarkAsPaidDialog').then((module) => ({
    default: module.MarkAsPaidDialog,
  })),
);

export const MarkAsPaidButton: FunctionComponent<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  const user = useUser();
  if (!user.is_staff) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Mark as paid')}
      disabled={row.state !== 'created'}
      iconNode={<MoneyIcon weight="bold" />}
      tooltip={
        row.state !== 'created'
          ? translate('Only a created invoice can be marked as paid.')
          : ''
      }
      action={() =>
        openDialog(MarkAsPaidDialog, {
          resolve: { invoice: row, refetch },
          size: 'lg',
        })
      }
    />
  );
};
