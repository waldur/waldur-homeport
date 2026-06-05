import { FC, useMemo } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import {
  MatrixRoom,
  MatrixRoomMember,
  matrixRoomsMembersList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { TableTabsContainer } from '@/customer/list/TableTabsContainer';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { MatrixExportsList } from './MatrixExportsList';

const NavItem = ({ title, eventKey, count }) => (
  <Nav.Item className="text-nowrap">
    <Nav.Link eventKey={eventKey}>
      {title}
      {count !== undefined && (
        <Badge variant="default" pill outline className="ms-2">
          {count}
        </Badge>
      )}
    </Nav.Link>
  </Nav.Item>
);

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
    <TableTabsContainer
      defaultActiveKey="history"
      unmountOnExit
      className="min-h-375px"
    >
      <div className="overflow-auto">
        <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
          <NavItem
            title={translate('History exports')}
            eventKey="history"
            count={undefined}
          />
          <NavItem
            title={translate('Members')}
            eventKey="members"
            count={row.members_count}
          />
        </Nav>
      </div>
      <Tab.Content className="overflow-auto">
        <Tab.Pane eventKey="history" unmountOnExit>
          <MatrixExportsList room_uuid={row.uuid} hasActionBar={false} />
        </Tab.Pane>
        <Tab.Pane eventKey="members" unmountOnExit>
          <MembersTable roomUuid={row.uuid} />
        </Tab.Pane>
      </Tab.Content>
    </TableTabsContainer>
  </ExpandableContainer>
);
