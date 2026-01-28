import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { SshKey } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const VersionHistoryDialog = lazyComponent(() =>
  import('@waldur/version-history/VersionHistoryDialog').then((module) => ({
    default: module.VersionHistoryDialog,
  })),
);

export const KeyVersionHistoryAction = ({ row }: { row: SshKey }) => (
  <DialogActionItem
    title={translate('Version history')}
    modalComponent={VersionHistoryDialog}
    dialogSize="xl"
    resource={row}
    extraResolve={{
      entityType: 'ssh_key',
      entityUuid: row.uuid,
      entityName: row.name,
    }}
    iconNode={<ClockCounterClockwiseIcon weight="bold" />}
    staff
  />
);
