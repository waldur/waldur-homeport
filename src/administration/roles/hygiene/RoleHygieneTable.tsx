import { useMemo } from 'react';
import {
  RoleHygieneFinding,
  RoleHygieneFindingSeverityEnum,
} from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';
import { formatRoleType } from '@/permissions/utils';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { RoleHygieneFindingDetails } from './RoleHygieneFindingDetails';
import { filterFindings, getCheckLabel } from './utils';

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
}

export const RoleHygieneTable = ({
  findings,
  severity,
  onSelectSeverity,
  version,
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
          render: ({ row }) => (
            <>
              <span className="d-block text-dark fw-semibold">
                {getCheckLabel(row.check)}
              </span>
              <span className="d-block text-muted font-monospace fs-8">
                {row.check}
              </span>
            </>
          ),
        },
        {
          title: translate('Role'),
          // Not `copyField`: it floats the button beside the whole two-line
          // cell instead of next to the code it copies.
          render: ({ row }) => (
            <>
              <span className="d-block text-dark">
                {row.role_description || translate('(no description)')}
              </span>
              <span className="d-flex align-items-center gap-1">
                <span className="text-muted font-monospace fs-8">
                  {row.role_name}
                </span>
                <CopyToClipboardButton
                  value={row.role_name}
                  size={14}
                  verbose={translate('Role code')}
                />
              </span>
            </>
          ),
        },
        {
          title: translate('Scope'),
          render: ({ row }) => (
            <>
              {row.scope_type ? formatRoleType(row.scope_type) : '—'}{' '}
              {row.is_system_role && (
                <Badge variant="neutral" size="sm" shape="pill" tone="outline">
                  {translate('System')}
                </Badge>
              )}
            </>
          ),
        },
      ]}
      tabs={tabs}
      expandableRow={RoleHygieneFindingDetails}
      title={translate('Findings')}
      verboseName={translate('findings')}
      hasQuery={true}
      showPageSizeSelector={true}
      placeholderHasRetry={false}
    />
  );
};
