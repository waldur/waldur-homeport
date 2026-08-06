import { useMemo } from 'react';
import {
  openportalRemoteProjectAuditList,
  RemoteProjectAuditEntry,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { DetailsDiff } from '@/openportal/DetailsDiff';
import { Field } from '@/resource/summary/Field';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import {
  OpenportalRemoteProjectAuditFilter,
  OpenportalRemoteProjectAuditFilterFormId,
  selectOpenportalRemoteProjectAuditFilter,
} from '@/table/generated/OpenportalRemoteProjectAuditFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const eventTypeLabels: Record<RemoteProjectAuditEntry['event_type'], string> = {
  award_attempted: translate('Award attempted'),
  award_rejected: translate('Award rejected'),
  award_created: translate('Award created'),
  award_updated: translate('Award updated'),
  award_update_confirmed: translate('Award update confirmed'),
  award_update_rejected: translate('Award update rejected'),
  state_changed: translate('State changed'),
  resource_deleted: translate('Resource deleted'),
};

const eventTypeVariants: Record<
  RemoteProjectAuditEntry['event_type'],
  'success' | 'danger' | 'warning' | 'info' | 'default'
> = {
  award_attempted: 'info',
  award_rejected: 'danger',
  award_created: 'success',
  award_updated: 'info',
  award_update_confirmed: 'success',
  award_update_rejected: 'danger',
  state_changed: 'default',
  resource_deleted: 'danger',
};

const AuditEntryExpandableRow = ({ row }: { row: RemoteProjectAuditEntry }) => {
  const hasDetails = row.previous_details || row.new_details;

  return (
    <ExpandableContainer asTable>
      <Field label={translate('Note')} value={row.note} />
      <Field
        label={translate('Remote response')}
        value={
          row.remote_response ? JSON.stringify(row.remote_response) : undefined
        }
      />
      {hasDetails && (
        <Field
          label={translate('Changes')}
          value={
            <DetailsDiff
              before={row.previous_details}
              after={row.new_details}
            />
          }
        />
      )}
    </ExpandableContainer>
  );
};

interface RemoteProjectAuditLogProps {
  remoteProjectUuid?: string;
  hideTitle?: boolean;
}

export const RemoteProjectAuditLog = ({
  remoteProjectUuid,
  hideTitle,
}: RemoteProjectAuditLogProps) => {
  const tableId = remoteProjectUuid
    ? `RemoteProjectAuditLog-${remoteProjectUuid}`
    : 'AllRemoteProjectsAuditLog';

  const values = useFilterValues(tableId);

  const filter = useMemo(() => {
    const selected = selectOpenportalRemoteProjectAuditFilter(values);
    return { ...selected, remote_project_uuid: remoteProjectUuid };
  }, [values, remoteProjectUuid]);

  const tableProps = useTable({
    table: tableId,
    syncFiltersToURL: !remoteProjectUuid,
    fetchData: createFetcher(openportalRemoteProjectAuditList),
    queryField: 'q',
    filter,
  });

  const columns: Array<Column> = [
    {
      title: translate('Timestamp'),
      orderField: 'timestamp',
      render: ({ row }) => formatDateTime(row.timestamp),
      keys: ['timestamp'],
      id: 'timestamp',
    },
    {
      title: translate('Event'),
      orderField: 'event_type',
      render: ({ row }) => (
        <Badge variant={eventTypeVariants[row.event_type] || 'default'} pill>
          {eventTypeLabels[row.event_type] || row.event_type}
        </Badge>
      ),
      keys: ['event_type'],
      id: 'event_type',
    },
    {
      title: translate('Performed by'),
      render: ({ row }) => renderFieldOrDash(row.performed_by_full_name),
      keys: ['performed_by_full_name'],
      id: 'performed_by',
    },
    {
      title: translate('Note'),
      render: ({ row }) => renderFieldOrDash(row.note),
      keys: ['note'],
      optional: true,
      id: 'note',
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Audit log')}
      title={hideTitle ? undefined : translate('Audit log')}
      hideTitle={hideTitle}
      showPageSizeSelector={true}
      standalone={!remoteProjectUuid}
      hasActionBar={!remoteProjectUuid}
      hasQuery={!remoteProjectUuid}
      hasOptionalColumns
      expandableRow={AuditEntryExpandableRow}
      filters={<OpenportalRemoteProjectAuditFilter />}
      formId={OpenportalRemoteProjectAuditFilterFormId}
    />
  );
};
