import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithTabs } from '@/table/TableWithTabs';
import { TableTab } from '@/table/types';
import { useTable } from '@/table/useTable';

const checklistUsageMost = [
  { checklist: 'GDPR Data Processing Audit', organizations: 82 },
  { checklist: 'Data Protection & Privacy', organizations: 73 },
  { checklist: 'ISO 27001 Risk Assessment', organizations: 24 },
];

const checklistUsageLeast = [
  { checklist: 'Some Least Used 1', organizations: 2 },
  { checklist: 'Some Least Used 2', organizations: 1 },
];

const PureTable = (props) => {
  return (
    <Table
      {...props}
      columns={[
        { title: translate('Checklist'), render: ({ row }) => row.checklist },
        {
          title: translate('Organizations'),
          render: ({ row }) => row.organizations,
        },
      ]}
      minHeight="auto"
      verboseName={translate('Checklists')}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};

const LeastUsedChecklistsTable = () => {
  const tableProps = useTable({
    table: 'LeastUsedChecklists',
    fetchData: createClientPaginatedFetcher(checklistUsageLeast),
  });

  return <PureTable {...tableProps} />;
};

const MostUsedChecklistsTable = () => {
  const tableProps = useTable({
    table: 'MostUsedChecklists',
    fetchData: createClientPaginatedFetcher(checklistUsageMost),
  });

  return <PureTable {...tableProps} />;
};

const tabs: TableTab[] = [
  {
    key: 'most-used-checklists',
    title: translate('Most used checklists'),
    component: MostUsedChecklistsTable,
  },
  {
    key: 'least-used-checklists',
    title: translate('Least used checklists'),
    component: LeastUsedChecklistsTable,
  },
];

export const ChecklistUsageAnalyticsTable = () => {
  return (
    <TableWithTabs
      tabs={tabs}
      title={translate('Checklist usage analytics')}
      headerClassName="min-h-60px"
      className="h-100"
    />
  );
};
