import { FC, useMemo } from 'react';
import { Issue, supportIssuesList } from 'waldur-js-client';

import { formatDate, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { IssueLinkField } from '@/issues/list/IssueLinkField';
import { IssuesListExpandableRow } from '@/issues/list/IssuesListExpandableRow';
import { StatusColumn } from '@/issues/list/StatusColumn';
import { TitleColumn } from '@/issues/list/TitleColumn';
import { createFetcher } from '@/table/api';
import {
  SupportIssuesFilter as IssuesFilter,
  selectSupportIssuesFilter as selectIssuesFilter,
  StatusOptions,
  SupportIssuesFilterFormId,
} from '@/table/generated/SupportIssuesFilter';
import Table from '@/table/Table';
import { Column, TableProps } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { IssueCreateButton } from './IssueCreateButton';

interface OwnProps {
  hiddenColumns?: (
    'customer' | 'project' | 'caller' | 'time_in_progress' | 'resource_type'
  )[];

  scope?: Record<string, any>;
  scopeType?: string;
  filter?: Record<string, any>;
  standalone?: boolean;
  /**
   * When set, clicking a request's key selects it in place (calling this
   * callback) instead of navigating to the detail route. Used by the expanded
   * Helpdesk drawer's two-pane layout, where the detail renders in the right
   * pane without a route change.
   */
  onIssueSelect?: (issue: Issue) => void;
  /** UUID of the currently selected request, highlighted in the list. */
  selectedIssueUuid?: string;
}

export const IssuesList: FC<OwnProps & Partial<TableProps>> = ({
  ...props
}) => {
  const { hiddenColumns = [], standalone = true, onIssueSelect } = props;
  const user = useUser();
  const supportOrStaff = user?.is_staff || user?.is_support || false;

  const values = useFilterValues(`issuesList-${props.scope?.uuid}`);
  const filterValues = useMemo(() => selectIssuesFilter(values), [values]);

  const tableProps = useTable({
    table: `issuesList-${props.scope?.uuid}`,
    syncFiltersToURL: true,
    fetchData: createFetcher(supportIssuesList),
    queryField: 'query',
    filter: props.filter || filterValues,
  });

  const columns = useMemo(() => {
    const columns: Array<Column<Issue>> = [
      {
        title: translate('Key'),
        orderField: 'key',
        // In select (two-pane) mode the whole row selects, so the key is plain
        // text — a routing link would navigate away instead of selecting.
        render: ({ row }) =>
          onIssueSelect ? (
            renderFieldOrDash(row.key)
          ) : (
            <IssueLinkField label={renderFieldOrDash(row.key)} row={row} />
          ),

        export: (row) => renderFieldOrDash(row.key),
        exportKeys: ['key'],
      },
      {
        title: translate('Status'),
        render: StatusColumn,
        orderField: 'status',
        filter: 'status',
        inlineFilter: (row) =>
          StatusOptions.filter((op) => op.value === row.status),
        export: (row) => renderFieldOrDash(row.status),
        exportKeys: ['status'],
      },
      {
        title: translate('Title'),
        render: TitleColumn,
        orderField: 'summary',
        export: 'summary',
      },
      {
        visible: false,
        title: translate('Title'),
        render: null,
        export: 'description',
      },
    ];

    if (supportOrStaff && !hiddenColumns.includes('resource_type')) {
      columns.push({
        visible: false,
        title: translate('Service type'),
        render: null,
        export: (row) => renderFieldOrDash(row.resource_type),
        exportKeys: ['resource_type'],
      });
    }
    if (!hiddenColumns.includes('customer')) {
      columns.push({
        title: translate('Organization'),
        orderField: 'customer_name',
        render: ({ row }) => renderFieldOrDash(row.customer_name),
        export: (row) => renderFieldOrDash(row.customer_name),
        exportKeys: ['customer_name'],
      });
    }
    if (!hiddenColumns.includes('project')) {
      columns.push({
        title: translate('Project'),
        orderField: 'project_name',
        render: ({ row }) => renderFieldOrDash(row.project_name),
        export: (row) => renderFieldOrDash(row.project_name),
        exportKeys: ['project_name'],
      });
    }
    if (!hiddenColumns.includes('caller')) {
      columns.push({
        title: translate('Caller'),
        orderField: 'caller_full_name',
        render: ({ row }) => renderFieldOrDash(row.caller_full_name),
        export: (row) => renderFieldOrDash(row.caller_full_name),
        exportKeys: ['caller_full_name'],
      });
    }

    if (supportOrStaff) {
      columns.push({
        visible: false,
        title: translate('Reporter'),
        render: null,
        export: (row) => renderFieldOrDash(row.reporter_name),
        exportKeys: ['reporter_name'],
      });
      columns.push({
        visible: false,
        title: translate('Assigned to'),
        render: null,
        export: (row) => renderFieldOrDash(row.assignee_name),
        exportKeys: ['assignee_name'],
      });
    }
    columns.push({
      visible: false,
      title: translate('Created'),
      render: null,
      export: (row) => formatDate(row.created),
      exportKeys: ['created'],
    });

    if (supportOrStaff && !hiddenColumns.includes('time_in_progress')) {
      columns.push({
        title: translate('Time in progress'),
        render: ({ row }) => <>{formatRelative(row.created)}</>,
        export: (row) => formatRelative(row.created),
        exportKeys: ['created'],
      });
    }
    return columns;
  }, [hiddenColumns, supportOrStaff, onIssueSelect]);

  // Don't leak the two-pane-only props onto the Table/DOM via the {...props}
  // spread below; selection is expressed through columns and rowClass instead.
  const {
    onIssueSelect: _omitSelect,
    selectedIssueUuid,
    ...tablePassthrough
  } = props;

  return (
    <Table
      {...tableProps}
      formId={SupportIssuesFilterFormId}
      // The expanded two-pane Helpdesk uses a minimal toolbar (search + Export
      // + Create only), so the filter menu — which doesn't fit the narrow
      // master pane — is dropped in select mode.
      filters={props.filter || onIssueSelect ? undefined : <IssuesFilter />}
      columns={columns}
      title={translate('Support requests')}
      verboseName={translate('support requests')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      standalone={standalone}
      tableActions={
        props.scope &&
        !props.scope.is_removed && (
          <IssueCreateButton
            scope={props.scope}
            scopeType={props.scopeType}
            refetch={tableProps.fetch}
          />
        )
      }
      onRowClick={onIssueSelect}
      hoverable={Boolean(onIssueSelect)}
      // In select (two-pane) mode a row click selects the request into the
      // right pane, so the inline expandable row is suppressed — otherwise
      // TableBody's row-click both selects AND toggles the inline expand.
      expandableRow={
        onIssueSelect
          ? undefined
          : ({ row }) => (
              <IssuesListExpandableRow
                row={row}
                supportOrStaff={supportOrStaff}
              />
            )
      }
      {...tablePassthrough}
      rowClass={({ row }) =>
        selectedIssueUuid && row.uuid === selectedIssueUuid
          ? 'issues-list-row-selected'
          : ''
      }
    />
  );
};
