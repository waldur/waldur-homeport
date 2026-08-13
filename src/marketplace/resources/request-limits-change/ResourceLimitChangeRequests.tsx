import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { FC, FunctionComponent, useMemo, useState } from 'react';
import {
  marketplaceResourceLimitChangeRequestsApprove,
  marketplaceResourceLimitChangeRequestsList,
  marketplaceResourceLimitChangeRequestsReject,
  Resource,
  ResourceLimitChangeRequest,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

interface Props {
  resource: Resource;
}

const isPending = (row: { state: string }) =>
  row.state?.toLowerCase() === 'pending';

const ApproveAction: FC<{
  row: ResourceLimitChangeRequest;
  resource: Resource;
  refetch(): void;
}> = ({ row, resource, refetch }) => {
  const user = useUser();
  const { mutate, isPending: isMutating } = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceLimitChangeRequestsApprove({
        path: { uuid: row.uuid },
      }),
    successMessage: translate('Limit change request has been approved.'),
    errorMessage: translate('Unable to approve limit change request.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to approve this request?'),
    },
  });

  // Approving applies the limits through a marketplace order, so it needs
  // order creation rights. Rejecting creates nothing and stays available.
  if (
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_ORDER,
      projectId: resource.project_uuid,
      customerId: resource.customer_uuid,
    })
  ) {
    return null;
  }

  return (
    <ActionItem
      action={() => mutate(undefined)}
      disabled={isMutating}
      title={translate('Approve')}
      iconNode={<CheckIcon weight="bold" />}
    />
  );
};

const RejectAction: FC<{
  row: ResourceLimitChangeRequest;
  refetch(): void;
}> = ({ row, refetch }) => {
  const { mutate, isPending: isMutating } = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceLimitChangeRequestsReject({
        path: { uuid: row.uuid },
      }),
    successMessage: translate('Limit change request has been rejected.'),
    errorMessage: translate('Unable to reject limit change request.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to reject this request?'),
    },
  });

  return (
    <ActionItem
      action={() => mutate(undefined)}
      disabled={isMutating}
      title={translate('Reject')}
      iconNode={<XIcon weight="bold" />}
    />
  );
};

export const ResourceLimitChangeRequests: FunctionComponent<Props> = ({
  resource,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  const tabs = useMemo(
    () => [
      {
        key: 'pending',
        title: translate('Pending'),
        active: activeTab === 'pending',
        onSelect: () => setActiveTab('pending'),
      },
      {
        key: 'all',
        title: translate('All'),
        active: activeTab === 'all',
        onSelect: () => setActiveTab('all'),
      },
    ],
    [activeTab],
  );

  const filter = useMemo(
    () => ({
      resource_uuid: resource.uuid,
      o: ['-created'],
      ...(activeTab === 'pending' && { state: ['pending'] }),
    }),
    [resource.uuid, activeTab],
  );

  const tableProps = useTable({
    table: `resource-limit-change-requests-${resource.uuid}`,
    fetchData: createFetcher(marketplaceResourceLimitChangeRequestsList),
    filter,
  });

  const refetch = tableProps.fetch;

  return (
    <Table
      {...(tableProps as any)}
      title={translate('Limit change requests')}
      tabs={tabs}
      columns={[
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
        },
        {
          title: translate('Requested by'),
          render: ({ row }) => (
            <>{renderFieldOrDash(row.created_by_full_name)}</>
          ),
        },
        {
          title: translate('Requested limits'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(
                row.requested_limits
                  ? Object.entries(row.requested_limits)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')
                  : null,
              )}
            </>
          ),
        },
        {
          title: translate('Current limits'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(
                row.current_limits
                  ? Object.entries(row.current_limits)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')
                  : null,
              )}
            </>
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{renderFieldOrDash(row.state)}</>,
        },
        {
          title: translate('Reviewed by'),
          render: ({ row }) => (
            <>{renderFieldOrDash(row.reviewed_by_full_name)}</>
          ),
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
        },
      ]}
      verboseName={translate('limit change requests')}
      enableExport={false}
      rowActions={({ row }) =>
        isPending(row) ? (
          <ActionsDropdown row={row}>
            <ApproveAction row={row} resource={resource} refetch={refetch} />
            <RejectAction row={row} refetch={refetch} />
          </ActionsDropdown>
        ) : null
      }
    />
  );
};
