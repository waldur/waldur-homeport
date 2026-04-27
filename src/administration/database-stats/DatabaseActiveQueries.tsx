import { FC, useMemo } from 'react';

import { AccordionCard } from '@/core/AccordionCard';
import { Badge } from '@/core/Badge';
import { CopyToClipboard } from '@/core/CopyToClipboard';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import type { ActiveQuery, ActiveQueriesStats } from './api';
import { formatDuration, getQueryDurationHealth } from './utils';

interface DatabaseActiveQueriesProps {
  data: ActiveQueriesStats;
}

export const DatabaseActiveQueries: FC<DatabaseActiveQueriesProps> = ({
  data,
}) => {
  const hasLongQueries = data.longest_duration_seconds > 30;

  const tableProps = useTable({
    table: 'DatabaseActiveQueries',
    fetchData: () =>
      Promise.resolve({
        rows: data.queries,
        resultCount: data.queries.length,
      }),
  });

  const columns = useMemo(
    () => [
      {
        title: translate('PID'),
        render: ({ row }: { row: ActiveQuery }) => <code>{row.pid}</code>,
      },
      {
        title: translate('Duration'),
        render: ({ row }: { row: ActiveQuery }) => {
          const health = getQueryDurationHealth(row.duration_seconds);
          const variant =
            health === 'danger'
              ? 'danger'
              : health === 'warning'
                ? 'warning'
                : 'primary';
          return (
            <Badge variant={variant} pill outline>
              {formatDuration(row.duration_seconds)}
            </Badge>
          );
        },
      },
      {
        title: translate('State'),
        render: ({ row }: { row: ActiveQuery }) => (
          <span className="text-capitalize">{row.state}</span>
        ),
      },
      {
        title: translate('Wait event'),
        render: ({ row }: { row: ActiveQuery }) =>
          row.wait_event_type ? (
            <Badge
              variant={row.wait_event_type === 'Lock' ? 'warning' : 'secondary'}
              pill
              outline
            >
              {row.wait_event_type}
            </Badge>
          ) : (
            <span className="text-muted">-</span>
          ),
      },
      {
        title: translate('Query'),
        render: ({ row }: { row: ActiveQuery }) => (
          <div className="d-flex align-items-center gap-2">
            <Tip id={`query-${row.pid}`} label={row.query_preview}>
              <code
                className="fs-8 text-truncate"
                style={{ maxWidth: '300px' }}
              >
                {row.query_preview.length > 50
                  ? `${row.query_preview.substring(0, 50)}...`
                  : row.query_preview}
              </code>
            </Tip>
            <CopyToClipboard value={row.query_preview} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AccordionCard
      id="database-active-queries"
      title={translate('Active queries')}
      subtitle={translate('{count} queries running', { count: data.count })}
      defaultOpen={hasLongQueries}
      className="mb-6"
    >
      {data.queries.length === 0 ? (
        <p className="text-muted mb-0">{translate('No active queries')}</p>
      ) : (
        <Table<ActiveQuery>
          {...tableProps}
          columns={columns}
          verboseName={translate('queries')}
          hasActionBar={false}
          hoverShadow={false}
          initialPageSize={10}
          minHeight="auto"
        />
      )}
      {data.waiting_on_locks > 0 && (
        <div className="mt-3 text-warning">
          {translate('{count} queries waiting on locks', {
            count: data.waiting_on_locks,
          })}
        </div>
      )}
    </AccordionCard>
  );
};
