import { useMemo } from 'react';
import {
  RoleHygieneFinding,
  RoleHygieneFindingSeverityEnum,
} from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';
import { formatRoleType } from '@/permissions/utils';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { RoleHygieneFindingDetails } from './RoleHygieneFindingDetails';
import { filterFindings, getCheckLabel } from './utils';

import './RoleHygienePage.scss';

const SEVERITY_VARIANTS: Record<RoleHygieneFindingSeverityEnum, BadgeVariant> =
  {
    error: 'danger',
    warning: 'warning',
    info: 'neutral',
  };

const getSeverityLabel = (severity: RoleHygieneFindingSeverityEnum) =>
  ({
    error: translate('Error'),
    warning: translate('Warning'),
    info: translate('Info'),
  })[severity];

interface RoleHygieneTableProps {
  findings: RoleHygieneFinding[];
  severity?: RoleHygieneFindingSeverityEnum;
  onSelectSeverity(severity?: RoleHygieneFindingSeverityEnum): void;
  /** Changes whenever a fresh report arrives, so the rows are re-read. */
  version?: number;
  /** Set when the table sits in the roles page's tabs. */
  portal?: TableWithPortal['portal'];
}

export const RoleHygieneTable = ({
  findings,
  severity,
  onSelectSeverity,
  version,
  portal,
}: RoleHygieneTableProps) => {
  const filter = useMemo(() => ({ severity, version }), [severity, version]);

  const tableProps = useTable<RoleHygieneFinding>({
    table: 'RoleHygieneTable',
    fetchData: (request) => {
      const rows = filterFindings(findings, {
        severity,
        query: request.filter?.query,
      });
      const start = (request.currentPage - 1) * request.pageSize;
      return Promise.resolve({
        rows: rows.slice(start, start + request.pageSize),
        resultCount: rows.length,
      });
    },
    filter,
    queryField: 'query',
  });
  const { resetPagination } = tableProps;

  const tabs = useMemo(() => {
    const count = (value?: RoleHygieneFindingSeverityEnum) =>
      filterFindings(findings, { severity: value }).length;
    return [
      { key: 'all', label: translate('All'), value: undefined },
      { key: 'error', label: translate('Errors'), value: 'error' as const },
      {
        key: 'warning',
        label: translate('Warnings'),
        value: 'warning' as const,
      },
      { key: 'info', label: translate('Info'), value: 'info' as const },
    ].map((tab) => ({
      key: tab.key,
      title: (
        <>
          {tab.label}
          <Badge
            variant="neutral"
            size="sm"
            shape="pill"
            tone="outline"
            className="ms-2"
          >
            {count(tab.value)}
          </Badge>
        </>
      ),
      active: severity === tab.value,
      // Table only resets the page for its own search and filters, not for a
      // changed `filter` prop, so a narrower tab could open past its last page.
      onSelect: () => {
        resetPagination();
        onSelectSeverity(tab.value);
      },
    }));
  }, [findings, severity, onSelectSeverity, resetPagination]);

  return (
    <Table<RoleHygieneFinding>
      {...tableProps}
      columns={[
        {
          title: translate('Severity'),
          width: '130px',
          render: ({ row }) => (
            <Badge
              variant={SEVERITY_VARIANTS[row.severity]}
              size="sm"
              shape="pill"
              tone="outline"
            >
              {getSeverityLabel(row.severity)}
            </Badge>
          ),
        },
        {
          title: translate('Problem'),
          render: ({ row }) => getCheckLabel(row.check),
        },
        {
          // The check's machine-readable id, split out of the Problem cell so
          // each column holds one value — the Name/Code pairing the catalogue
          // table already uses.
          title: translate('Check'),
          render: ({ row }) => (
            <span className="font-monospace">{row.check}</span>
          ),
          copyField: (row) => row.check,
        },
        {
          title: translate('Role'),
          render: ({ row }) => renderFieldOrDash(row.role_description),
        },
        {
          title: translate('Code'),
          render: ({ row }) => (
            <span className="font-monospace">{row.role_name}</span>
          ),
          copyField: (row) => row.role_name,
        },
        {
          title: translate('Scope'),
          render: ({ row }) =>
            renderFieldOrDash(
              row.scope_type ? formatRoleType(row.scope_type) : null,
            ),
        },
      ]}
      tabs={tabs}
      expandableRow={RoleHygieneFindingDetails}
      title={translate('Findings')}
      verboseName={translate('findings')}
      className={portal ? 'role-hygiene-findings' : undefined}
      // Inside the roles page's tabs the card and the toolbar are the page's.
      portal={portal}
      hasActionBar={!portal}
      cardBordered={!portal}
      fullWidth={!!portal}
      hasQuery={true}
      showPageSizeSelector={true}
      placeholderHasRetry={false}
    />
  );
};
