import { ActionsDropdown } from '@/table/ActionsDropdown';

import { RemoteSyncDeleteAction } from './RemoteSyncDeleteAction';
import { RemoteSyncEditAction } from './RemoteSyncEditAction';
import { RemoteSyncEnableAction } from './RemoteSyncEnableAction';
import { RemoteSyncLastRunResultsAction } from './RemoteSyncLastRunResultsAction';
import { RemoteSyncSynchroniseAction } from './RemoteSyncSynchroniseAction';

export const RemoteSyncRowActions = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[
      RemoteSyncEnableAction,
      RemoteSyncSynchroniseAction,
      RemoteSyncLastRunResultsAction,
      RemoteSyncEditAction,
      RemoteSyncDeleteAction,
    ]}
  />
);
