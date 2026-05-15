import { FC } from 'react';
import { OpenStackPool } from 'waldur-js-client';

import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { AddHealthMonitorAction } from './actions/AddHealthMonitorAction';
import { AddMemberAction } from './actions/AddMemberAction';
import { DestroyPoolButton } from './actions/DestroyPoolButton';
import { EditPoolAction } from './actions/EditPoolAction';
import { PullPoolAction } from './actions/PullPoolAction';

interface PoolRowActionsProps {
  row: OpenStackPool;
  fetch(): void;
}

export const PoolRowActions: FC<PoolRowActionsProps> = ({ row, fetch }) => (
  <ActionsDropdownComponent>
    <AddMemberAction resource={row} refetch={fetch} />
    <AddHealthMonitorAction resource={row} refetch={fetch} />
    <EditPoolAction resource={row} refetch={fetch} />
    <PullPoolAction resource={row} refetch={fetch} />
    <DestroyPoolButton resource={row} refetch={fetch} />
  </ActionsDropdownComponent>
);
