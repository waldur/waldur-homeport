import { CopyIcon } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { CeleryTask } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface CeleryTaskTableProps {
  tasks: CeleryTask[];
  showDuration?: boolean;
}

const truncateTaskName = (name: string, maxLength = 40): string => {
  if (name.length <= maxLength) return name;
  const parts = name.split('.');
  if (parts.length > 2) {
    return `...${parts.slice(-2).join('.')}`;
  }
  return `${name.slice(0, maxLength)}...`;
};

const formatArgs = (args: unknown[]): string => {
  if (!args || args.length === 0) return '-';
  const str = JSON.stringify(args);
  if (str.length > 30) return str.slice(0, 30) + '...';
  return str;
};

const formatDuration = (startTime: number | null): string => {
  if (!startTime) return '-';
  const durationMs = Date.now() - startTime * 1000;
  const seconds = Math.floor(durationMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const CopyButton = ({ value }: { value: string }) => {
  const { showSuccess } = useNotify();
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      showSuccess(translate('Copied to clipboard'));
    });
  }, [value]);

  return (
    <button
      type="button"
      className="btn btn-icon btn-sm btn-light-primary ms-2"
      onClick={handleCopy}
      title={translate('Copy to clipboard')}
    >
      <CopyIcon size={14} weight="bold" />
    </button>
  );
};

export const CeleryTaskTable = ({
  tasks,
  showDuration = false,
}: CeleryTaskTableProps) => {
  const allTasks = useMemo(() => tasks, [tasks]);

  const tableProps = useTable<CeleryTask>({
    table: `CeleryTaskTable-${showDuration ? 'active' : 'other'}`,
    fetchData: (request) => {
      const start = (request.currentPage - 1) * request.pageSize;
      const paged = allTasks.slice(start, start + request.pageSize);
      return Promise.resolve({
        rows: paged,
        resultCount: allTasks.length,
      });
    },
  });

  return (
    <Table<CeleryTask>
      {...tableProps}
      columns={[
        {
          title: translate('Task name'),
          render: ({ row }) => (
            <Tip label={row.name} id={`task-name-${row.id}`}>
              <span className="text-dark fw-semibold">
                {truncateTaskName(row.name)}
              </span>
            </Tip>
          ),
        },
        {
          title: translate('Task ID'),
          render: ({ row }) => (
            <div className="d-flex align-items-center">
              <code className="text-muted fs-7">{row.id.slice(0, 8)}</code>
              <CopyButton value={row.id} />
            </div>
          ),
        },
        {
          title: translate('Args'),
          render: ({ row }) => (
            <Tip label={JSON.stringify(row.args)} id={`task-args-${row.id}`}>
              <code className="fs-7">{formatArgs(row.args)}</code>
            </Tip>
          ),
        },
        {
          title: translate('Worker PID'),
          render: ({ row }) =>
            row.worker_pid ? (
              <span className="text-dark">{row.worker_pid}</span>
            ) : (
              <span className="text-muted">-</span>
            ),
        },
        {
          title: showDuration ? translate('Duration') : translate('Status'),
          render: ({ row }) =>
            showDuration ? (
              row.time_start ? (
                <Tip
                  label={formatDateTime(row.time_start * 1000)}
                  id={`task-time-${row.id}`}
                >
                  <Badge variant="primary" light>
                    {formatDuration(row.time_start)}
                  </Badge>
                </Tip>
              ) : (
                <Badge variant="secondary" light>
                  {translate('Pending')}
                </Badge>
              )
            ) : row.acknowledged ? (
              <Badge variant="success" light>
                {translate('Acknowledged')}
              </Badge>
            ) : (
              <Badge variant="warning" light>
                {translate('Pending')}
              </Badge>
            ),
        },
        {
          title: translate('Priority'),
          render: ({ row }) => (
            <Badge
              variant={
                (row.delivery_info?.priority as number) > 0
                  ? 'info'
                  : 'secondary'
              }
              light
            >
              {(row.delivery_info?.priority as number) ?? 0}
            </Badge>
          ),
        },
      ]}
      verboseName={translate('tasks')}
    />
  );
};
