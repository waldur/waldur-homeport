import { FC, useMemo } from 'react';
import {
  MatrixRoom,
  MatrixRoomMember,
  matrixRoomsMembersList,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { MatrixExportsList } from './MatrixExportsList';

const memberStateLabel = (state: string) => {
  switch (state) {
    case 'join':
      return translate('Joined');
    case 'invite':
      return translate('Invited');
    case 'leave':
    case 'left':
      return translate('Left');
    case 'ban':
    case 'banned':
      return translate('Banned');
    default:
      return state;
  }
};

const MembersTable: FC<{ roomUuid: string }> = ({ roomUuid }) => {
  const filter = useMemo(() => ({}), []);

  const tableProps = useTable({
    table: `matrix-room-members-${roomUuid}`,
    fetchData: createFetcher((request) =>
      matrixRoomsMembersList({ ...request, path: { uuid: roomUuid } }),
    ),
    filter,
  });

  const columns: Column<MatrixRoomMember>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => <>{row.user_full_name}</>,
      id: 'user_full_name',
    },
    {
      title: translate('Matrix ID'),
      render: ({ row }) => <>{row.matrix_user_id}</>,
      id: 'matrix_user_id',
    },
    {
      title: translate('State'),
      render: ({ row }) => <>{memberStateLabel(row.membership_state)}</>,
      id: 'membership_state',
    },
    {
      title: translate('Power level'),
      render: ({ row }) => <>{row.power_level}</>,
      id: 'power_level',
    },
    {
      title: translate('Joined'),
      render: ({ row }) => renderFieldOrDash(formatDateTime(row.created)),
      id: 'created',
    },
  ];

  return (
    <Table<MatrixRoomMember>
      {...tableProps}
      columns={columns}
      verboseName={translate('members')}
      hideTitle
      hasActionBar={false}
    />
  );
};

export const MatrixRoomExpandableRow: FC<{ row: MatrixRoom }> = ({ row }) => (
  <ExpandableContainer>
    <EmbeddedTabs
      framed
      defaultValue="history"
      className="min-h-375px"
      tabs={[
        {
          key: 'history',
          title: translate('History exports'),
          content: (
            <MatrixExportsList room_uuid={row.uuid} hasActionBar={false} />
          ),
        },
        {
          key: 'members',
          title: translate('Members'),
          count: row.members_count,
          content: <MembersTable roomUuid={row.uuid} />,
        },
      ]}
    />
  </ExpandableContainer>
);
