import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  AdminAnnouncement,
  AdminAnnouncementsListData,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { AnnouncementFilter } from './AnnouncementFilter';
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
    label={row.type}
    outline
    pill
  />
);

const renderStatus = ({ row }) => (
  <StateIndicator
    variant={row.is_active ? 'success' : 'danger'}
    label={row.is_active ? 'Active' : 'Inactive'}
    outline
    pill
  />
);

const filtersSelector = createSelector(
  getFormValues('AdminAnnouncementsFilter'),
  (filterValues: any) => {
    const result: AdminAnnouncementsListData['query'] = {};
    if (filterValues?.type) {
      result.type = filterValues.type.value;
    }
    if (filterValues?.is_active) {
      result.is_active = filterValues.is_active.value;
    }
    return result;
  },
);

export const AnnouncementsList = () => {
  const filter = useSelector(filtersSelector);
  const tableProps = useTable({
    table: 'AdminAnnouncements',
    fetchData: createFetcher('admin-announcements'),
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
      filters={<AnnouncementFilter />}
    />
  );
};
