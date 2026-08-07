import { FC, useMemo } from 'react';
import {
  proposalMyRequestedResourcesList,
  UserRequestedResource,
} from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  ProposalMyRequestedResourcesFilter,
  ProposalMyRequestedResourcesFilterFormId,
  selectProposalMyRequestedResourcesFilter,
} from '@/table/generated/ProposalMyRequestedResourcesFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ProposalStateBadge } from './ProposalStateBadge';
import { RequestedLimits } from './RequestedLimits';

interface ResourceRequestsListProps {
  /** Narrows the list to one offering; omit for the profile-wide view. */
  offeringUuid?: string;
  title?: string;
}

export const ResourceRequestsList: FC<ResourceRequestsListProps> = ({
  offeringUuid,
  title,
}) => {
  const tableId = offeringUuid
    ? `ResourceRequests-${offeringUuid}`
    : 'ResourceRequests';
  const values = useFilterValues(tableId);

  const filter = useMemo(() => {
    const selected = selectProposalMyRequestedResourcesFilter(values);
    // The offering tab is already scoped to one offering, so its own filter
    // wins over anything the picker could say.
    return offeringUuid
      ? { ...selected, offering_uuid: offeringUuid }
      : selected;
  }, [values, offeringUuid]);

  const tableProps = useTable({
    table: tableId,
    fetchData: createFetcher(proposalMyRequestedResourcesList),
    filter,
    // Matches on offering, proposal, call and resource name — the four names
    // a row actually shows.
    queryField: 'query',
  });

  const columns = useMemo(
    () =>
      [
        {
          id: 'resource',
          // Falls back to the proposal name: the resource has no name of its
          // own until it is provisioned, so "Resource" would mislead here.
          title: translate('Request'),
          orderField: 'resource__name',
          render: ({ row }) => (
            <Link
              state="proposals.manage-proposal"
              params={{ proposal_uuid: row.proposal_uuid }}
              label={row.resource_name || row.proposal_name}
            />
          ),
        },
        // Redundant on the offering tab, where every row is the same offering.
        offeringUuid
          ? null
          : {
              id: 'offering',
              title: translate('Offering'),
              orderField: 'offering__name',
              render: ({ row }) => renderFieldOrDash(row.offering_name),
            },
        {
          id: 'call',
          title: translate('Call'),
          orderField: 'call__name',
          render: ({ row }) => renderFieldOrDash(row.call_name),
        },
        {
          id: 'limits',
          title: translate('Requested amount'),
          render: ({ row }) => (
            <RequestedLimits
              // Legacy rows carry the amounts inside attributes; see
              // ResourceRequestFormDialog.
              limits={
                row.limits && Object.keys(row.limits).length
                  ? row.limits
                  : (row.attributes?.limits as Record<string, unknown>)
              }
            />
          ),
        },
        {
          id: 'created',
          title: translate('Requested'),
          orderField: 'created',
          render: ({ row }) => renderFieldOrDash(formatDate(row.created)),
        },
        {
          id: 'proposal_state',
          title: translate('Proposal'),
          orderField: 'proposal__state',
          render: ({ row }) => (
            <ProposalStateBadge state={row.proposal_state} />
          ),
        },
        {
          id: 'resource_state',
          // Empty until the proposal is approved and the resource is created.
          title: translate('Resource state'),
          orderField: 'resource__state',
          render: ({ row }) => renderFieldOrDash(row.resource_state),
        },
      ].filter(Boolean),
    [offeringUuid],
  );

  return (
    <Table<UserRequestedResource>
      {...tableProps}
      title={title || translate('Resource requests')}
      columns={columns}
      verboseName={translate('resource requests')}
      hasQuery
      hasOptionalColumns
      filters={<ProposalMyRequestedResourcesFilter />}
      formId={ProposalMyRequestedResourcesFilterFormId}
    />
  );
};
