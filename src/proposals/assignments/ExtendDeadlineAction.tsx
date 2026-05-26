import { CalendarPlusIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { AssignmentBatchList } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const ExtendDeadlineDialog = lazyComponent(() =>
  import('./ExtendDeadlineDialog').then((m) => ({
    default: m.ExtendDeadlineDialog,
  })),
);

interface ExtendDeadlineActionProps {
  row: AssignmentBatchList;
  refetch: () => void;
}

export const ExtendDeadlineAction: FC<ExtendDeadlineActionProps> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();

  const handleExtendDeadline = useCallback(() => {
    openDialog(ExtendDeadlineDialog, {
      resolve: { batch: row, refetch },
    });
  }, [row, refetch, openDialog]);

  return (
    <ActionItem
      title={translate('Extend deadline')}
      action={handleExtendDeadline}
      iconNode={<CalendarPlusIcon weight="bold" />}
    />
  );
};
