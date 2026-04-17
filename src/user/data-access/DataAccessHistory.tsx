import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { usersDataAccessHistoryList } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import {
  UserDataAccessHistoryFilter,
  selectUserDataAccessHistoryFilter,
} from '@waldur/table/generated/UserDataAccessHistoryFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { DataAccessHistoryEntry } from './types';
import {
  formatFieldName,
  getAccessorCategory,
  getAccessorTypeBadgeVariant,
} from './utils';

interface DataAccessHistoryProps {
  userUuid: string;
  isViewerStaffOrSupport: boolean;
}

export const DataAccessHistory: FC<DataAccessHistoryProps> = ({
  userUuid,
  isViewerStaffOrSupport,
}) => {
  const filter = useSelector(selectUserDataAccessHistoryFilter);

  const fetchData = useMemo(
    () =>
      createFetcher(usersDataAccessHistoryList, { path: { uuid: userUuid } }),
    [userUuid],
  );

  const tableProps = useTable({
    table: `dataAccessHistory-${userUuid}`,
    fetchData,
    filter,
  });

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: translate('Date & Time'),
        orderField: 'timestamp',
        render: ({ row }: { row: DataAccessHistoryEntry }) => (
          <>{formatDateTime(row.timestamp)}</>
        ),
      },
      {
        title: translate('Accessor'),
        render: ({ row }: { row: DataAccessHistoryEntry }) => {
          if (isViewerStaffOrSupport && row.accessor) {
            return (
              <Link
                state="admin-user-users.details"
                params={{ user_uuid: row.accessor.uuid }}
              >
                {row.accessor.full_name || row.accessor.username}
              </Link>
            );
          }
          return (
            <span className="text-muted">
              {row.accessor_category || getAccessorCategory(row.accessor_type)}
            </span>
          );
        },
      },
      {
        title: translate('Access type'),
        render: ({ row }: { row: DataAccessHistoryEntry }) => (
          <Badge
            variant={getAccessorTypeBadgeVariant(row.accessor_type)}
            pill
            outline
          >
            {getAccessorCategory(row.accessor_type)}
          </Badge>
        ),
      },
      {
        title: translate('Fields accessed'),
        render: ({ row }: { row: DataAccessHistoryEntry }) => (
          <div className="d-flex flex-wrap gap-1">
            {row.accessed_fields.map((field) => (
              <Badge key={field} variant="secondary" pill outline>
                {formatFieldName(field)}
              </Badge>
            ))}
          </div>
        ),
      },
    ];

    if (isViewerStaffOrSupport) {
      baseColumns.push(
        {
          title: translate('IP address'),
          render: ({ row }: { row: DataAccessHistoryEntry }) => (
            <code className="text-muted small">
              {renderFieldOrDash(row.ip_address)}
            </code>
          ),
        },
        {
          title: translate('Context'),
          render: ({ row }: { row: DataAccessHistoryEntry }) =>
            row.context?.endpoint ? (
              <code className="text-muted small">
                {String(row.context.method)} {String(row.context.endpoint)}
              </code>
            ) : (
              <span className="text-muted">-</span>
            ),
        },
      );
    }

    return baseColumns;
  }, [isViewerStaffOrSupport]);

  return (
    <Table<DataAccessHistoryEntry>
      {...tableProps}
      columns={columns}
      filters={<UserDataAccessHistoryFilter />}
      verboseName={translate('Access history entries')}
      showPageSizeSelector
    />
  );
};
