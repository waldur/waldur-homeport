import { FC } from 'react';
import { Badge, Card } from 'react-bootstrap';
import { supportRequestTypesAdminList } from 'waldur-js-client';

import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { RequestTypeAdmin } from './api';
import { RequestTypeBatchActions } from './RequestTypeBatchActions';
import { RequestTypeCreateButton } from './RequestTypeCreateButton';
import { RequestTypeRowActions } from './RequestTypeRowActions';

const requestTypesAdminFetcher = createFetcher(supportRequestTypesAdminList);

const renderSyncStatus = ({ row }: { row: RequestTypeAdmin }) => (
  <Badge bg={row.is_synced ? 'info' : 'secondary'}>
    {row.is_synced ? translate('Synced') : translate('Manual')}
  </Badge>
);

const renderActiveStatus = ({ row }: { row: RequestTypeAdmin }) => (
  <StateIndicator
    variant={row.is_active ? 'success' : 'warning'}
    label={row.is_active ? translate('Active') : translate('Inactive')}
    outline
    pill
  />
);

export const RequestTypesList: FC = () => {
  const tableProps = useTable({
    table: 'RequestTypesAdmin',
    fetchData: requestTypesAdminFetcher,
  });

  const columns: Column<RequestTypeAdmin>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      copyField: (row) => row.name,
      keys: ['name'],
      id: 'name',
    },
    {
      title: translate('Issue type'),
      render: ({ row }) => row.issue_type_name,
      keys: ['issue_type_name'],
      id: 'issue_type_name',
    },
    {
      title: translate('Display order'),
      render: ({ row }) => row.order,
      keys: ['order'],
      id: 'order',
    },
    {
      title: translate('Source'),
      render: renderSyncStatus,
      keys: ['is_synced'],
      id: 'is_synced',
    },
    {
      title: translate('Status'),
      render: renderActiveStatus,
      keys: ['is_active'],
      id: 'is_active',
    },
  ];

  return (
    <Card className="card-bordered">
      <Card.Body>
        <Table
          {...tableProps}
          columns={columns}
          hasQuery
          enableMultiSelect
          multiSelectActions={({ rows, refetch }) => (
            <RequestTypeBatchActions rows={rows} refetch={refetch} />
          )}
          tableActions={<RequestTypeCreateButton refetch={tableProps.fetch} />}
          rowActions={({ row }) => (
            <RequestTypeRowActions row={row} refetch={tableProps.fetch} />
          )}
        />
      </Card.Body>
    </Card>
  );
};
