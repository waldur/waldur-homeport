import { ChatTeardropTextIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import {
  ManagedProject,
  openportalManagedProjectsList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate, formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useTitle } from '@/navigation/title';
import { BooleanFilter } from '@/table';
import { ActionButton } from '@/table/ActionButton';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import {
  OpenportalManagedProjectsFilter,
  selectOpenportalManagedProjectsFilter,
  OpenportalManagedProjectsFilterFormId,
} from '@/table/generated/OpenportalManagedProjectsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ManagedProjectActions } from './ManagedProjectActions';
import { ManagedProjectExpandableRow } from './ManagedProjectExpandableRow';
import { ManagedProjectNotesDialog } from './ManagedProjectNotesDialog';
import { isEmbargoed } from './utils';

const NotesButton = ({
  row,
  refetch,
}: {
  row: ManagedProject;
  refetch: () => void;
}) => {
  const { openDialog } = useModal();
  const count = row.details?.notes?.length ?? 0;

  return (
    <ActionButton
      title={String(count)}
      iconNode={<ChatTeardropTextIcon weight="bold" />}
      variant="tertiary"
      action={() =>
        openDialog(ManagedProjectNotesDialog, {
          row,
          resolve: { refetch },
          size: 'md',
        })
      }
    />
  );
};

const renderProjectTemplate = (row: any) => {
  if (row.project_template_data) {
    return row.project_template_data.name;
  }

  if (row.details.template) {
    return row.details.template;
  }

  return renderFieldOrDash(row.details.class);
};

const renderOffering = (destination: string) => {
  if (destination) {
    // split by "." and return the last part
    const parts = destination.split('.');
    return renderFieldOrDash(parts[parts.length - 1]);
  }
  return '-';
};

export const ManagedProjectsList = () => {
  useTitle(translate('Managed Projects'), '', 'browser');

  const values = useFilterValues(`ManagedProjectsList`);
  const hideEmbargoed = Boolean(values?.hide_embargoed);

  const filter = useMemo(
    () => selectOpenportalManagedProjectsFilter(values),
    [values],
  );

  const tableProps = useTable({
    table: `ManagedProjectsList`,
    syncFiltersToURL: true,
    fetchData: createFetcher(openportalManagedProjectsList),
    queryField: 'query',
    filter: {
      ...filter,
      state: filter?.state || ['pending'],
      // Filtered server-side: dropping rows from the fetched page instead
      // would leave the result count and the page contents disagreeing.
      ...(hideEmbargoed ? { hide_embargoed: true } : {}),
    },
  });

  const columns: Array<Column> = [
    {
      title: translate('Project'),
      orderField: 'row.details.name',
      render: ({ row }) => (
        <Link
          state="marketplace-provider-managed-project-detail"
          params={{ identifier: row.identifier, destination: row.destination }}
        >
          {row.details.name || row.identifier || DASH_ESCAPE_CODE}
        </Link>
      ),
      keys: ['name'],
      id: 'managedproject',
    },
    {
      title: translate('Notes'),
      render: ({ row }) => <NotesButton row={row} refetch={tableProps.fetch} />,
      keys: ['notes'],
      optional: true,
      id: 'notes',
    },
    {
      title: translate('Offering'),
      orderField: 'row.offering',
      render: ({ row }) => renderOffering(row.destination),
      keys: ['offering'],
      id: 'offering',
    },
    {
      title: translate('Project Template'),
      orderField: 'row.details.class',
      render: ({ row }) => renderProjectTemplate(row),
      keys: ['project-template'],
      id: 'project-template',
    },
    {
      title: translate('Description'),
      render: ({ row }) => renderFieldOrDash(row.details.description),
      keys: ['description'],
      optional: true,
      id: 'description',
    },
    {
      title: translate('Created'),
      render: ({ row }) => (
        <>{row.created ? formatDateTime(row.created) : DASH_ESCAPE_CODE}</>
      ),
      keys: ['created_date'],
      optional: true,
      id: 'created_date',
    },
    {
      title: translate('Start Date'),
      render: ({ row }) => (
        <>
          {row.details.start_date
            ? formatDate(row.details.start_date)
            : DASH_ESCAPE_CODE}
        </>
      ),
      keys: ['start_date'],
      optional: true,
      id: 'start_date',
    },
    {
      title: translate('End Date'),
      render: ({ row }) => (
        <>
          {row.details.end_date
            ? formatDate(row.details.end_date)
            : DASH_ESCAPE_CODE}
        </>
      ),
      keys: ['end_date'],
      optional: true,
      id: 'end_date',
    },
    {
      title: translate('Allocation'),
      render: ({ row }) => renderFieldOrDash(row.details.allocation),
      keys: ['allocation'],
      id: 'allocation',
    },
    {
      title: translate('State'),
      render: ({ row }) => (
        <>
          {row.state}
          {isEmbargoed(row) && (
            <Badge variant="warning" pill outline className="ms-1">
              {translate('Embargoed')}
            </Badge>
          )}
        </>
      ),
      keys: ['state'],
      id: 'state',
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Managed Projects')}
      title={translate('Managed Projects')}
      showPageSizeSelector={true}
      standalone
      hasOptionalColumns
      expandableRowClassName="py-2 pe-2"
      expandableRow={ManagedProjectExpandableRow}
      tableActions={
        <Link
          state="marketplace-provider-managed-projects-audit"
          buttonVariant="outline-primary"
        >
          {translate('Audit Log')}
        </Link>
      }
      rowActions={({ row }) => (
        <ManagedProjectActions project={row} refetch={tableProps.fetch} />
      )}
      filters={
        <>
          <OpenportalManagedProjectsFilter />
          <BooleanFilter
            title={translate('Hide embargoed')}
            name="hide_embargoed"
          />
        </>
      }
      formId={OpenportalManagedProjectsFilterFormId}
    />
  );
};
