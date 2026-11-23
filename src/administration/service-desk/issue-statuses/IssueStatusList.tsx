import { InfoIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { supportIssueStatusesList } from 'waldur-js-client';

import { Badge, HelpIcon } from 'waldur-ui';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { IssueStatusAdmin, IssueStatusTypes } from './api';
import { IssueStatusCreateButton } from './IssueStatusCreateButton';
import { IssueStatusRowActions } from './IssueStatusRowActions';

const issueStatusesFetcher = createFetcher(supportIssueStatusesList);

const renderType = ({ row }: { row: IssueStatusAdmin }) => (
  <Badge
    variant={row.type === IssueStatusTypes.RESOLVED ? 'success' : 'danger'}
    size="sm"
    shape="pill"
    tone="outline"
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
        <span className="flex items-center gap-1.5">
          {translate('Issue status mapping')}
          <HelpIcon
            label={translate(
              'Map your service desk status names to Waldur outcome types. "Resolved" statuses complete orders successfully. "Canceled" statuses terminate resources.',
            )}
            icon={InfoIcon}
            size={18}
            className="text-quaternary cursor-pointer"
          />
        </span>
      }
      tableActions={<IssueStatusCreateButton refetch={tableProps.fetch} />}
      rowActions={({ row }) => (
        <IssueStatusRowActions row={row} refetch={tableProps.fetch} />
      )}
    />
  );
};
