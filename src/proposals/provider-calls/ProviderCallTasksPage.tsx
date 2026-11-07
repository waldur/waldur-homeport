import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  MyTask,
  OfferingTeamSlot,
  proposalMyTasksList,
  proposalRequestedOfferingsTeamSlotsList,
} from 'waldur-js-client';

import { Tabs } from 'waldur-ui';

import { translate } from '@/i18n';
import { useUrlTab } from '@/navigation/useUrlTab';
import { DueDate, TaskLink } from '@/proposals/review/MyTasksPage';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useRowsTable } from '@/table/useRowsTable';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import {
  SlotDueCell,
  SlotHolderCell,
  SlotProposalCell,
} from './TeamSlotsTable';

/**
 * The viewer's own call work on this provider's offerings: requests to
 * answer, assessments to write, steps to complete. Every row is the viewer's
 * to do; another manager's work is in their own list.
 */
const ProviderCallTasksTable: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const filter = useMemo(
    () => ({ provider_uuid: providerUuid }),
    [providerUuid],
  );
  const tableProps = useTable({
    table: 'ProviderCallTasks',
    fetchData: createFetcher(proposalMyTasksList),
    filter,
    exportFields: [
      translate('What is needed'),
      translate('Offering'),
      translate('Proposal'),
      translate('Call'),
      translate('Step'),
      translate('Due'),
    ],
    exportRow: (row: MyTask) => [
      row.needed_label,
      row.offering_name ?? '',
      row.proposal_name ?? '',
      row.call_name ?? '',
      row.step_name ?? '',
      row.due_at ?? '',
    ],
  });

  const columns: Column<MyTask>[] = [
    {
      title: translate('What is needed'),
      render: ({ row }) => <TaskLink task={row} />,
    },
    {
      title: translate('Offering'),
      render: ({ row }) => <>{renderFieldOrDash(row.offering_name)}</>,
    },
    {
      title: translate('Proposal'),
      render: ({ row }) =>
        row.proposal_name ? (
          <div className="flex flex-col">
            <span>{row.proposal_name}</span>
            {row.proposal_slug ? (
              <span className="text-quaternary">{row.proposal_slug}</span>
            ) : null}
          </div>
        ) : (
          <>{renderFieldOrDash(null)}</>
        ),
    },
    {
      title: translate('Call'),
      render: ({ row }) => (
        <div className="flex flex-col">
          <span>{renderFieldOrDash(row.call_name)}</span>
          {row.round_name ? (
            <span className="text-quaternary">{row.round_name}</span>
          ) : null}
        </div>
      ),
    },
    {
      title: translate('Step'),
      render: ({ row }) => <>{renderFieldOrDash(row.step_name)}</>,
    },
    { title: translate('Due'), render: ({ row }) => <DueDate task={row} /> },
  ];

  return (
    <Table<MyTask>
      {...tableProps}
      columns={columns}
      title={translate('My call tasks')}
      subtitle={translate('Your work in calls on your offerings.')}
      verboseName={translate('tasks')}
      emptyMessage={translate('Nothing waiting for you on these offerings.')}
      rowClass={({ row }) => (row.is_overdue ? 'table-danger' : '')}
      hasQuery={false}
      enableExport
    />
  );
};

/**
 * Everything open for the offerings' teams in the provider's calls, whoever
 * holds it: the slots each team member, a hand-on or the call's stand-in
 * managers have yet to finish.
 */
const TeamOpenWorkTable: FC<{ providerUuid: string }> = ({ providerUuid }) => {
  // One unpaginated list, fetched once and paged in memory.
  const { data, isLoading, error } = useQuery({
    queryKey: ['ProviderTeamOpenWork', providerUuid],
    queryFn: () =>
      proposalRequestedOfferingsTeamSlotsList({
        query: { provider_uuid: providerUuid },
      }).then((response) => response.data),
  });
  const tableProps = useRowsTable('ProviderTeamOpenWork', data ?? [], data, {
    exportFields: [
      translate('Proposal'),
      translate('Offering'),
      translate('Call'),
      translate('Step'),
      translate('Held by'),
      translate('Due'),
    ],
    exportRow: (row: OfferingTeamSlot) => [
      row.proposal_name,
      row.offering_name,
      row.call_name,
      row.step_name,
      row.delegate_name ?? '',
      row.due_at ?? '',
    ],
  });
  const columns: Column<OfferingTeamSlot>[] = [
    {
      title: translate('Proposal'),
      render: ({ row }) => (
        <SlotProposalCell row={row} providerUuid={providerUuid} />
      ),
    },
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.offering_name}</>,
    },
    { title: translate('Call'), render: ({ row }) => <>{row.call_name}</> },
    { title: translate('Step'), render: ({ row }) => <>{row.step_name}</> },
    { title: translate('Held by'), render: SlotHolderCell },
    { title: translate('Due'), render: SlotDueCell },
  ];
  return (
    <Table<OfferingTeamSlot>
      {...tableProps}
      loading={isLoading || tableProps.loading}
      error={error || tableProps.error}
      columns={columns}
      title={translate('Team’s open work')}
      subtitle={translate('Open steps on your offerings, whoever holds them.')}
      verboseName={translate('slots')}
      emptyMessage={translate('Nothing open for your offerings’ teams.')}
      rowClass={({ row }) => (row.overdue ? 'table-danger' : '')}
      hasQuery={false}
      enableExport
    />
  );
};

const TABS = [{ key: 'mine' }, { key: 'team' }];

export const ProviderCallTasksPage: FC = () => {
  const customer = useCustomer();
  const { activeKey, handleSelect } = useUrlTab(TABS, 'tab');
  if (!customer) {
    return null;
  }
  return (
    <Tabs
      value={activeKey}
      onValueChange={handleSelect}
      listProps={{ className: 'mb-3' }}
      items={[
        {
          value: 'mine',
          title: translate('My tasks'),
          content: <ProviderCallTasksTable providerUuid={customer.uuid} />,
        },
        {
          value: 'team',
          title: translate('Team’s open work'),
          content: <TeamOpenWorkTable providerUuid={customer.uuid} />,
        },
      ]}
    />
  );
};
