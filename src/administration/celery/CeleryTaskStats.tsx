import { useMemo } from 'react';

import { AccordionCard } from '@/core/AccordionCard';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface CeleryTaskStatsProps {
  total: Record<string, number>;
}

interface TaskStatRow {
  name: string;
  count: number;
}

const truncateTaskType = (name: string, maxLength = 50): string => {
  if (name.length <= maxLength) return name;
  const parts = name.split('.');
  if (parts.length > 2) {
    return `...${parts.slice(-2).join('.')}`;
  }
  return `${name.slice(0, maxLength)}...`;
};

export const CeleryTaskStats = ({ total }: CeleryTaskStatsProps) => {
  const allTasks = useMemo(() => {
    return Object.entries(total).map(([name, count]) => ({ name, count }));
  }, [total]);

  const totalCount = useMemo(
    () => allTasks.reduce((sum, task) => sum + task.count, 0),
    [allTasks],
  );

  const tableProps = useTable<TaskStatRow>({
    table: 'CeleryTaskStats',
    fetchData: (request) => {
      let filtered = [...allTasks];

      // Apply search filter
      if (request.query) {
        const query = request.query.toLowerCase();
        filtered = filtered.filter((task) =>
          task.name.toLowerCase().includes(query),
        );
      }

      // Apply sorting
      if (request.sortField) {
        filtered.sort((a, b) => {
          const aVal = a[request.sortField];
          const bVal = b[request.sortField];
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return request.sortOrder
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          }
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return request.sortOrder ? aVal - bVal : bVal - aVal;
          }
          return 0;
        });
      } else {
        // Default sort by count descending
        filtered.sort((a, b) => b.count - a.count);
      }

      // Apply pagination
      const start = (request.currentPage - 1) * request.pageSize;
      const paged = filtered.slice(start, start + request.pageSize);

      return Promise.resolve({
        rows: paged,
        resultCount: filtered.length,
      });
    },
  });

  if (allTasks.length === 0) {
    return null;
  }

  return (
    <AccordionCard
      title={translate('Task execution statistics')}
      className="mb-6"
      defaultOpen
    >
      <Table<TaskStatRow>
        {...tableProps}
        subtitle={translate('{count} task types, {total} total executions', {
          count: allTasks.length,
          total: totalCount.toLocaleString(),
        })}
        columns={[
          {
            title: translate('Task type'),
            orderField: 'name',
            render: ({ row }) => {
              const needsTruncation = row.name.length > 50;
              return needsTruncation ? (
                <Tip label={row.name} id={`task-type-${row.name}`}>
                  <code className="fs-7">{truncateTaskType(row.name)}</code>
                </Tip>
              ) : (
                <code className="fs-7">{row.name}</code>
              );
            },
          },
          {
            title: translate('Executions'),
            orderField: 'count',
            className: 'text-end',
            render: ({ row }) => (
              <span className="fw-semibold">{row.count.toLocaleString()}</span>
            ),
          },
          {
            title: translate('Percentage'),
            className: 'text-end',
            render: ({ row }) => {
              const percentage = ((row.count / totalCount) * 100).toFixed(1);
              return (
                <div className="d-flex align-items-center justify-content-end">
                  <span className="text-muted me-2">{percentage}%</span>
                  <div
                    className="progress h-6px w-50px"
                    style={{ minWidth: '50px' }}
                  >
                    <div
                      className="progress-bar bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            },
          },
        ]}
        verboseName={translate('task statistics')}
        hasQuery={true}
        showPageSizeSelector={true}
      />
    </AccordionCard>
  );
};
