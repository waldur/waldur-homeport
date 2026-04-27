import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  projectEndDateChangeRequestsApprove,
  projectEndDateChangeRequestsList,
  projectEndDateChangeRequestsReject,
  projectsRetrieve,
  Project,
} from 'waldur-js-client';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { setCurrentProject } from '@/workspace/actions';

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
    params: { tab: 'end-date-change-requests', subtab: 'pending' },
  },
  {
    key: 'all',
    title: translate('All'),
    params: { tab: 'end-date-change-requests', subtab: 'all' },
  },
];

export const ProjectEndDateChangeRequests: FunctionComponent<
  ProjectEndDateChangeRequestsProps
> = ({ project }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { params } = useCurrentStateAndParams();
  const activeTab = params.subtab || 'pending';

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
  }, [tableProps.fetch, queryClient]);

  const refetchProject = useCallback(async () => {
    if (!project?.uuid) return;
    const response = await projectsRetrieve({
      path: { uuid: project.uuid },
    });
    dispatch(setCurrentProject(response.data as Project));
  }, [project?.uuid, dispatch]);

  const approveMutation = useMutation({
    mutationFn: ({ uuid, comment }: { uuid: string; comment?: string }) =>
      projectEndDateChangeRequestsApprove({
        path: { uuid },
        body: comment ? { comment } : {},
      }),
    onSuccess: async () => {
      dispatch(showSuccess(translate('Request has been approved.')));
      refetch();
      await refetchProject();
    },
    onError: (error) => {
      dispatch(
        showErrorResponse(error, translate('Unable to approve request.')),
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ uuid, comment }: { uuid: string; comment?: string }) =>
      projectEndDateChangeRequestsReject({
        path: { uuid },
        body: comment ? { comment } : {},
      }),
    onSuccess: () => {
      dispatch(showSuccess(translate('Request has been rejected.')));
      refetch();
    },
    onError: (error) => {
      dispatch(
        showErrorResponse(error, translate('Unable to reject request.')),
      );
    },
  });

  const handleApprove = useCallback(
    async (row: { uuid: string }) => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate('Are you sure you want to approve this request?'),
        );
        approveMutation.mutate({ uuid: row.uuid });
      } catch {
        // User cancelled
      }
    },
    [dispatch, approveMutation],
  );

  const handleReject = useCallback(
    async (row: { uuid: string }) => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate('Are you sure you want to reject this request?'),
        );
        rejectMutation.mutate({ uuid: row.uuid });
      } catch {
        // User cancelled
      }
    },
    [dispatch, rejectMutation],
  );

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
            <ActionItem
              action={() => handleApprove(row)}
              title={translate('Approve')}
              iconNode={<CheckIcon weight="bold" />}
            />
            <ActionItem
              action={() => handleReject(row)}
              title={translate('Reject')}
              iconNode={<XIcon weight="bold" />}
            />
          </ActionsDropdown>
        ) : null
      }
    />
  );
};
