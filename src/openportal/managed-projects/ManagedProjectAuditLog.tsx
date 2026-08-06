import { useMemo } from 'react';
import {
  ManagedProjectAuditEntry,
  openportalManagedProjectAuditList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { DetailsDiff } from '@/openportal/DetailsDiff';
import { Field } from '@/resource/summary/Field';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import {
  OpenportalManagedProjectAuditFilter,
  OpenportalManagedProjectAuditFilterFormId,
  selectOpenportalManagedProjectAuditFilter,
} from '@/table/generated/OpenportalManagedProjectAuditFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const eventTypeLabels: Record<ManagedProjectAuditEntry['event_type'], string> =
  {
    created: translate('Created'),
    approved: translate('Approved'),
    rejected: translate('Rejected'),
    deleted: translate('Deleted'),
    note_added: translate('Note added'),
    details_updated: translate('Details updated'),
    project_attached: translate('Project attached'),
    project_detached: translate('Project detached'),
  };

const eventTypeVariants: Record<
  ManagedProjectAuditEntry['event_type'],
  'success' | 'danger' | 'warning' | 'info' | 'default'
> = {
  created: 'info',
  approved: 'success',
  rejected: 'danger',
  deleted: 'danger',
  note_added: 'default',
  details_updated: 'info',
  project_attached: 'success',
  project_detached: 'warning',
};

const AuditEntryExpandableRow = ({
  row,
}: {
  row: ManagedProjectAuditEntry;
}) => {
  const hasDetails = row.previous_details || row.new_details;

  return (
    <ExpandableContainer asTable>
      <Field label={translate('Note')} value={row.note} />
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

interface ManagedProjectAuditLogProps {
  identifier?: string;
  destination?: string;
  hideTitle?: boolean;
}

export const ManagedProjectAuditLog = ({
  identifier,
  destination,
  hideTitle,
}: ManagedProjectAuditLogProps) => {
  const scoped = Boolean(identifier && destination);
  const tableId = scoped
    ? `ManagedProjectAuditLog-${identifier}-${destination}`
    : 'AllManagedProjectsAuditLog';

  const values = useFilterValues(tableId);

  const filter = useMemo(() => {
    const selected = selectOpenportalManagedProjectAuditFilter(values);
    return {
      ...selected,
      managed_project_identifier: identifier,
      managed_project_destination: destination,
    };
  }, [values, identifier, destination]);

  const tableProps = useTable({
    table: tableId,
    syncFiltersToURL: !scoped,
    fetchData: createFetcher(openportalManagedProjectAuditList),
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

  if (!scoped) {
    columns.splice(1, 0, {
      title: translate('Project'),
      render: ({ row }) => renderFieldOrDash(row.identifier),
      keys: ['identifier'],
      id: 'identifier',
    });
  }

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Audit log')}
      title={hideTitle ? undefined : translate('Audit log')}
      hideTitle={hideTitle}
      showPageSizeSelector={true}
      standalone={!scoped}
      hasActionBar={!scoped}
      hasQuery={!scoped}
      hasOptionalColumns
      expandableRow={AuditEntryExpandableRow}
      filters={<OpenportalManagedProjectAuditFilter />}
      formId={OpenportalManagedProjectAuditFilterFormId}
    />
  );
};
