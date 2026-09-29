import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { Call } from '../types';
import { canUpdateCall } from '../utils';

const ExportCallDialog = lazyComponent(() =>
  import('./ExportCallDialog').then((m) => ({
    default: m.ExportCallDialog,
  })),
);

interface CallRowActionsProps {
  row: Call;
  refetch(): void;
}

export const CallRowActions: FC<CallRowActionsProps> = ({ row, refetch }) => {
  const user = useUser();
  const { openDialog } = useModal();

  // Export is the only row action, and it takes the right to edit the call.
  // A user who lacks it on this call never will from this list, so the row
  // gets no menu at all rather than one with nothing usable in it.
  if (!canUpdateCall(user, row)) {
    return null;
  }

  return (
    <ActionsDropdown row={row} refetch={refetch}>
      <ActionItem
        title={translate('Export')}
        action={() => openDialog(ExportCallDialog, { resolve: { call: row } })}
        iconNode={<DownloadSimpleIcon weight="bold" />}
      />
    </ActionsDropdown>
  );
};
