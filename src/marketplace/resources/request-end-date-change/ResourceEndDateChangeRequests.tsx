import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { FC, FunctionComponent, useMemo, useState } from 'react';
import {
  marketplaceResourceEndDateChangeRequestsApprove,
  marketplaceResourceEndDateChangeRequestsList,
  marketplaceResourceEndDateChangeRequestsReject,
  Resource,
  ResourceEndDateChangeRequest,
} from 'waldur-js-client';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { ReviewStateField } from '@/core/ReviewStateField';
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
  row: ResourceEndDateChangeRequest;
  refetch(): void;
}> = ({ row, refetch }) => {
  const { mutate, isPending: isMutating } = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceEndDateChangeRequestsApprove({
        path: { uuid: row.uuid },
      }),
    successMessage: translate(
      'End date change request has been approved and the end date has been updated.',
    ),
    errorMessage: translate('Unable to approve end date change request.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Approving changes the end date of this resource immediately. Continue?',
      ),
    },
  });

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
  row: ResourceEndDateChangeRequest;
  refetch(): void;
}> = ({ row, refetch }) => {
  const { mutate, isPending: isMutating } = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceEndDateChangeRequestsReject({
        path: { uuid: row.uuid },
      }),
    successMessage: translate('End date change request has been rejected.'),
    errorMessage: translate('Unable to reject end date change request.'),
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

export const ResourceEndDateChangeRequests: FunctionComponent<Props> = ({
  resource,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const user = useUser();

  // Requesters reach this table too — the list scopes rows to their own — so
  // they can follow what became of what they asked for. Only someone who may
  // decide gets the row actions.
  const canDecide =
    user?.is_staff ||
    user?.is_support ||
    hasPermission(user, {
      permission: PermissionEnum.SET_RESOURCE_END_DATE,
      projectId: resource.project_uuid,
      customerId: resource.customer_uuid,
    });

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
    table: `resource-end-date-change-requests-${resource.uuid}`,
    fetchData: createFetcher(marketplaceResourceEndDateChangeRequestsList),
    filter,
  });

  const refetch = tableProps.fetch;

  return (
    <Table
      {...(tableProps as any)}
      title={translate('End date change requests')}
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
        },
        {
          title: translate('Current end date'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(
                row.current_end_date ? formatDate(row.current_end_date) : null,
              )}
            </>
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ReviewStateField state={row.state} />,
        },
        {
          title: translate('Comment'),
          render: ({ row }) => <>{renderFieldOrDash(row.comment)}</>,
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
      verboseName={translate('end date change requests')}
      enableExport={false}
      rowActions={({ row }) =>
        canDecide && isPending(row) ? (
          <ActionsDropdown row={row}>
            <ApproveAction row={row} refetch={refetch} />
            <RejectAction row={row} refetch={refetch} />
          </ActionsDropdown>
        ) : null
      }
    />
  );
};
