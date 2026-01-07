import { Info } from '@phosphor-icons/react';
import { FC } from 'react';

import { Badge } from '@waldur/core/Badge';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import {
  IssueStatusAdmin,
  issueStatusesFetcher,
  IssueStatusTypes,
} from './api';
import { IssueStatusCreateButton } from './IssueStatusCreateButton';
import { IssueStatusRowActions } from './IssueStatusRowActions';

const renderType = ({ row }: { row: IssueStatusAdmin }) => (
  <Badge
    variant={row.type === IssueStatusTypes.RESOLVED ? 'success' : 'danger'}
    size="sm"
    pill
    outline
  >
    {row.type_display}
  </Badge>
);

export const IssueStatusList: FC = () => {
  const tableProps = useTable({
    table: 'IssueStatusAdmin',
    fetchData: issueStatusesFetcher,
  });

  const columns: Column<IssueStatusAdmin>[] = [
    {
      title: translate('Status name'),
      render: ({ row }) => row.name,
      copyField: (row) => row.name,
      keys: ['name'],
      id: 'name',
    },
    {
      title: translate('Outcome type'),
      render: renderType,
      keys: ['type', 'type_display'],
      id: 'type',
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      hasQuery
      title={
        <span className="d-flex align-items-center gap-2">
          {translate('Issue status mapping')}
          <Tip
            id="issue-status-mapping-info"
            label={translate(
              'Map your service desk status names to Waldur outcome types. "Resolved" statuses complete orders successfully. "Canceled" statuses terminate resources.',
            )}
          >
            <Info size={18} className="text-muted cursor-pointer" />
          </Tip>
        </span>
      }
      tableActions={<IssueStatusCreateButton refetch={tableProps.fetch} />}
      rowActions={({ row }) => (
        <IssueStatusRowActions row={row} refetch={tableProps.fetch} />
      )}
    />
  );
};
