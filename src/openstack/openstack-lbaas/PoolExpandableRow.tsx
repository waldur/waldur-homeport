import { FC, useMemo, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import {
  OpenStackHealthMonitor,
  OpenStackPool,
  OpenStackPoolMember,
  openstackHealthMonitorsList,
  openstackPoolMembersList,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceState } from '@/resource/state/ResourceState';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { HealthMonitorRowActions } from './HealthMonitorRowActions';
import { MemberRowActions } from './MemberRowActions';
import { OperatingStatusBadge } from './OperatingStatusBadge';

interface PoolExpandableRowProps {
  row: OpenStackPool;
}

const MembersTable: FC<{ poolUuid: string }> = ({ poolUuid }) => {
  const filter = useMemo(() => ({ pool_uuid: poolUuid }), [poolUuid]);
  const tableProps = useTable({
    table: `pool-members-${poolUuid}`,
    fetchData: createFetcher(openstackPoolMembersList),
    filter,
  });

  return (
    <Table<OpenStackPoolMember>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.name),
        },
        {
          title: translate('Address'),
          render: ({ row }) => renderFieldOrDash(row.address),
        },
        {
          title: translate('Port'),
          render: ({ row }) => renderFieldOrDash(row.protocol_port),
        },
        {
          title: translate('Weight'),
          render: ({ row }) => renderFieldOrDash((row as any).weight),
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <OperatingStatusBadge status={row.operating_status} />
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('members')}
      rowActions={MemberRowActions}
      hasActionBar={false}
      minHeight="auto"
      initialPageSize={5}
    />
  );
};

const HealthMonitorTable: FC<{ poolUuid: string }> = ({ poolUuid }) => {
  const filter = useMemo(() => ({ pool_uuid: poolUuid }), [poolUuid]);
  const tableProps = useTable({
    table: `pool-healthmonitors-${poolUuid}`,
    fetchData: createFetcher(openstackHealthMonitorsList),
    filter,
  });

  return (
    <Table<OpenStackHealthMonitor>
      {...tableProps}
      columns={[
        {
          title: translate('Type'),
          render: ({ row }) => renderFieldOrDash(row.type),
        },
        {
          title: translate('Delay (s)'),
          render: ({ row }) => renderFieldOrDash(row.delay),
        },
        {
          title: translate('Timeout (s)'),
          render: ({ row }) => renderFieldOrDash(row.timeout),
        },
        {
          title: translate('Max retries'),
          render: ({ row }) => renderFieldOrDash(row.max_retries),
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <OperatingStatusBadge status={row.operating_status} />
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('health monitors')}
      rowActions={HealthMonitorRowActions}
      hasActionBar={false}
      minHeight="auto"
      initialPageSize={5}
    />
  );
};

export const PoolExpandableRow: FC<PoolExpandableRowProps> = ({ row }) => {
  const [activeTab, setActiveTab] = useState('members');

  return (
    <ExpandableContainer>
      <Tab.Container
        activeKey={activeTab}
        onSelect={setActiveTab}
        unmountOnExit
      >
        <Nav variant="tabs" className="nav-line-tabs flex-nowrap mb-4">
          <Nav.Item>
            <Nav.Link eventKey="members">{translate('Members')}</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="health-monitor">
              {translate('Health Monitor')}
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content className="overflow-auto">
          <Tab.Pane eventKey="members" unmountOnExit>
            <MembersTable poolUuid={row.uuid} />
          </Tab.Pane>
          <Tab.Pane eventKey="health-monitor" unmountOnExit>
            <HealthMonitorTable poolUuid={row.uuid} />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </ExpandableContainer>
  );
};
