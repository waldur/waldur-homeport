import { useSelector } from 'react-redux';
import { AdminAnnouncement, adminAnnouncementsList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import {
  AdminAnnouncementsFilter,
  selectAdminAnnouncementsFilter,
} from '@waldur/table/generated/AdminAnnouncementsFilter';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { AnnouncementTypeOptions } from '../utils';

import { AnnouncementRowActions } from './AnnouncementRowActions';
import { AnnouncementCreateButton } from './CreateAnnouncementButton';

const renderType = ({ row }) => (
  <StateIndicator
    variant={
      row.type === 'information'
        ? 'info'
        : row.type === 'warning'
          ? 'warning'
          : 'danger'
    }
    label={
      AnnouncementTypeOptions.find((opt) => opt.value === row.type)?.label ||
      row.type
    }
    outline
    pill
  />
);

const renderStatus = ({ row }) => (
  <StateIndicator
    variant={row.is_active ? 'success' : 'danger'}
    label={row.is_active ? translate('Active') : translate('Inactive')}
    outline
    pill
  />
);

export const AnnouncementsList = () => {
  const filter = useSelector(selectAdminAnnouncementsFilter);
  const tableProps = useTable({
    table: 'AdminAnnouncements',
    fetchData: createFetcher(adminAnnouncementsList),
    filter,
    queryField: 'description',
  });
  const columns: Column<AdminAnnouncement>[] = [
    {
      title: 'Announcement',
      render: ({ row }) => row.description,
      keys: ['description'],
      id: 'description',
    },
    {
      title: 'Type',
      render: renderType,
      filter: 'type',
      keys: ['type'],
      id: 'type',
      orderField: 'type',
    },
    {
      title: 'Start date',
      render: ({ row }) => formatDateTime(row.active_from),
      filter: 'active_from',
      keys: ['active_from'],
      id: 'active_from',
      orderField: 'active_from',
    },
    {
      title: 'End date',
      render: ({ row }) => formatDateTime(row.active_to),
      filter: 'active_to',
      keys: ['active_to'],
      id: 'active_to',
      orderField: 'active_to',
    },
    {
      title: 'Status',
      render: renderStatus,
      filter: 'is_active',
      keys: ['is_active'],
      id: 'is_active',
    },
    {
      title: 'Created at',
      render: ({ row }) => formatDateTime(row.created),
      keys: ['created'],
      id: 'created',
      orderField: 'created',
      optional: true,
    },
  ];

  return (
    <Table<AdminAnnouncement>
      {...tableProps}
      columns={columns}
      hasQuery
      hasOptionalColumns
      tableActions={<AnnouncementCreateButton refetch={tableProps.fetch} />}
      rowActions={({ row }) => (
        <AnnouncementRowActions refetch={tableProps.fetch} row={row} />
      )}
      filters={<AdminAnnouncementsFilter />}
    />
  );
};
