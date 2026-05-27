import { useQueryClient } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useCallback, useMemo } from 'react';
import {
  Project,
  projectEndDateChangeRequestsList,
  projectsRetrieve,
} from 'waldur-js-client';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useSetProject } from '@/workspace/hooks';

import { ApproveRequestAction } from './ApproveRequestAction';
import { RejectRequestAction } from './RejectRequestAction';

interface ProjectEndDateChangeRequestsProps {
  project: Project;
}

const isPending = (row: { state: string }) =>
  row.state?.toLowerCase() === 'pending';

const TABLE_TABS = [
  {
    key: 'pending',
    title: translate('Pending'),
    default: true,
    params: { tab: 'end-date-change-requests', section: 'pending' },
  },
  {
    key: 'all',
    title: translate('All'),
    params: { tab: 'end-date-change-requests', section: 'all' },
  },
];

export const ProjectEndDateChangeRequests: FunctionComponent<
  ProjectEndDateChangeRequestsProps
> = ({ project }) => {
  const setCurrentProject = useSetProject();

  const queryClient = useQueryClient();
  const { params } = useCurrentStateAndParams();
  const activeTab = params.section || 'pending';

  const filter = useMemo(
    () => ({
      project_uuid: project?.uuid,
      ...(activeTab === 'pending' && { state: ['pending'] }),
    }),
    [project?.uuid, activeTab],
  );

  const tableProps = useTable({
    table: 'project-end-date-change-requests',
    fetchData: createFetcher(projectEndDateChangeRequestsList),
    filter,
  });

  const refetch = useCallback(() => {
    tableProps.fetch();
    queryClient.invalidateQueries({
      queryKey: ['project-end-date-change-requests'],
    });
  }, [queryClient, tableProps.fetch]);

  const refetchProject = useCallback(async () => {
    if (!project?.uuid) return;
    const response = await projectsRetrieve({
      path: { uuid: project.uuid },
    });
    setCurrentProject(response.data);
  }, [project?.uuid]);

  return (
    <Table
      {...tableProps}
      title={translate('End date change requests')}
      tabs={TABLE_TABS}
      columns={[
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          export: (row) => formatDateTime(row.created),
        },
        {
          title: translate('Requested end date'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(
                row.requested_end_date
                  ? formatDate(row.requested_end_date)
                  : null,
              )}
            </>
          ),
          export: (row) =>
            renderFieldOrDash(
              row.requested_end_date
                ? formatDate(row.requested_end_date)
                : null,
            ),
        },
        {
          title: translate('Created by'),
          render: ({ row }) => (
            <>{renderFieldOrDash(row.created_by_full_name)}</>
          ),
          export: (row) => renderFieldOrDash(row.created_by_full_name),
        },
        {
          title: translate('Reason for modifying'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(
                row.comment ? (
                  <Tip
                    label={row.comment}
                    id={`comment-tip-${row.uuid}`}
                    delay={{ show: 0, hide: 0 }}
                    tipClassName="text-start"
                  >
                    <span
                      className="ellipsis d-inline-block"
                      style={{ width: 150 }}
                    >
                      {row.comment}
                    </span>
                  </Tip>
                ) : null,
              )}
            </>
          ),
          export: (row) => renderFieldOrDash(row.comment),
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{renderFieldOrDash(row.state)}</>,
          export: (row) => renderFieldOrDash(row.state),
        },
        {
          title: translate('Reviewed by'),
          render: ({ row }) => (
            <>{renderFieldOrDash(row.reviewed_by_full_name)}</>
          ),
          export: (row) => renderFieldOrDash(row.reviewed_by_full_name),
        },
        {
          title: translate('Reviewed at'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(
                row.reviewed_at ? formatDateTime(row.reviewed_at) : null,
              )}
            </>
          ),
          export: (row) =>
            renderFieldOrDash(
              row.reviewed_at ? formatDateTime(row.reviewed_at) : null,
            ),
        },
      ]}
      verboseName={translate('end date change requests')}
      enableExport={false}
      rowActions={({ row }) =>
        isPending(row) ? (
          <ActionsDropdown row={row}>
            <ApproveRequestAction
              row={row}
              refetch={refetch}
              onSuccess={refetchProject}
            />
            <RejectRequestAction row={row} refetch={refetch} />
          </ActionsDropdown>
        ) : null
      }
    />
  );
};
