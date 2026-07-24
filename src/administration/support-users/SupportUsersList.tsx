import {
  ChatTextIcon,
  PaperclipIcon,
  TicketIcon,
  UserCheckIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { useMemo } from 'react';
import { SupportUser, supportUsersList } from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import {
  AdminSupportUsersFilter,
  AdminSupportUsersFilterFormId,
  selectAdminSupportUsersFilter,
} from '@/table/generated/AdminSupportUsersFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { SupportUserActions } from './SupportUserActions';
import { SupportUserConnectionsRow } from './SupportUserConnectionsRow';
import { SupportUserCreateButton } from './SupportUserCreateButton';

// Four labelled badges wrapped onto several lines and made every row tall.
// Icon + number on a single nowrap line keeps the row compact; the meaning of
// each number lives in its tooltip.
const ConnectionCounts = ({ row }: { row: SupportUser }) => {
  const counts = [
    {
      key: 'reported',
      icon: <TicketIcon weight="bold" />,
      value: row.reported_issues_count,
      label: translate('Reported tickets'),
    },
    {
      key: 'assigned',
      icon: <UserCheckIcon weight="bold" />,
      value: row.assigned_issues_count,
      label: translate('Assigned tickets'),
    },
    {
      key: 'comments',
      icon: <ChatTextIcon weight="bold" />,
      value: row.comments_count,
      label: translate('Comments'),
    },
    {
      key: 'attachments',
      icon: <PaperclipIcon weight="bold" />,
      value: row.attachments_count,
      label: translate('Attachments'),
    },
  ];
  return (
    <div className="d-flex gap-3 text-nowrap">
      {counts.map((item) => (
        <Tip
          key={item.key}
          id={`support-user-${item.key}-${row.uuid}`}
          label={item.label}
        >
          <span
            className={classNames(
              'd-inline-flex align-items-center gap-1',
              !item.value && 'text-muted',
            )}
          >
            {item.icon}
            {item.value || 0}
          </span>
        </Tip>
      ))}
    </div>
  );
};

export const SupportUsersList = () => {
  // Support users are readable by staff and support, but every write is
  // staff-only in the backend, so non-staff get a read-only table.
  const canManage = Boolean(useUser()?.is_staff);
  const filterValues = useFilterValues('SupportUsersList');
  const filter = useMemo(
    () => selectAdminSupportUsersFilter(filterValues),
    [filterValues],
  );
  const tableProps = useTable({
    table: 'SupportUsersList',
    fetchData: createFetcher(supportUsersList),
    filter,
    // Backed by the `query` filter, which spans name, backend ID and the
    // linked user's first/last name and email.
    queryField: 'query',
    syncFiltersToURL: true,
  });

  return (
    <Table<SupportUser>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          orderField: 'name',
          render: ({ row }) => row.name,
          copyField: (row) => row.name,
        },
        {
          title: translate('Helpdesk'),
          orderField: 'backend_name',
          render: ({ row }) => renderFieldOrDash(row.backend_name),
        },
        {
          title: translate('Backend ID'),
          orderField: 'backend_id',
          render: ({ row }) => renderFieldOrDash(row.backend_id),
        },
        {
          title: translate('Linked user'),
          render: ({ row }) =>
            renderFieldOrDash(
              row.user_full_name && row.user_email
                ? `${row.user_full_name} (${row.user_email})`
                : row.user_full_name || row.user_email,
            ),
        },
        {
          title: translate('Connections'),
          render: ({ row }) => <ConnectionCounts row={row} />,
        },
        {
          title: translate('Active'),
          orderField: 'is_active',
          render: ({ row }) => <BooleanField value={row.is_active} />,
        },
      ]}
      verboseName={translate('support users')}
      hasQuery={true}
      filters={<AdminSupportUsersFilter />}
      formId={AdminSupportUsersFilterFormId}
      expandableRow={SupportUserConnectionsRow}
      rowActions={
        canManage
          ? ({ row }) => (
              <SupportUserActions row={row} refetch={tableProps.fetch} />
            )
          : undefined
      }
      showPageSizeSelector={true}
      tableActions={
        canManage ? (
          <SupportUserCreateButton refetch={tableProps.fetch} />
        ) : undefined
      }
    />
  );
};
