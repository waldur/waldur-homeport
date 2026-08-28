import { FC, ReactNode, useMemo } from 'react';
import {
  proposalMyRequestedResourcesList,
  UserRequestedResource,
} from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { requestStateLabel, showsCallColumns } from '@/proposals/presentation';
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
  /** Rendered in the card toolbar beside search. */
  actions?: ReactNode;
}

export const ResourceRequestsList: FC<ResourceRequestsListProps> = ({
  offeringUuid,
  title,
  actions,
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
          // "Resource request" is what this object is called everywhere else —
          // the wizard step, the summary, the review section, this table's own
          // verboseName. Not the bare "Request" it used to be: two of its
          // neighbours are requests too (the amount asked for, the parent
          // request's state), so the unqualified word named all three.
          //
          // Not "Resource" either: the value falls back to the parent's name
          // because a resource has none of its own until it is provisioned.
          title: translate('Resource request'),
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
        showsCallColumns()
          ? {
              id: 'call',
              title: translate('Call'),
              orderField: 'call__name',
              render: ({ row }) => renderFieldOrDash(row.call_name),
            }
          : null,
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
          // "Created", as every other list in the app titles a creation date —
          // and not a second "Requested" sitting beside "Requested amount",
          // where it reads as another quantity rather than a date.
          title: translate('Created'),
          orderField: 'created',
          render: ({ row }) => renderFieldOrDash(formatDate(row.created)),
        },
        {
          id: 'proposal_state',
          // The parent's state, not the parent: "Resource state" next to it
          // says state, so this must too.
          title: requestStateLabel(),
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
      title={title}
      columns={columns}
      tableActions={actions}
      verboseName={translate('resource requests')}
      hasQuery
      // No hasOptionalColumns: the whole mechanism narrows the request via
      // `field`, building it from each column's `keys`
      // (useTableQuery: activeColumns -> field). This endpoint takes no
      // `field` param, so these columns carry no keys — and a keyless column
      // renders unconditionally (TableProvider: `!column.keys || ...`) while
      // its checkbox reads the unset `activeColumns` entry as off. The menu
      // therefore listed every column unchecked and toggling did nothing.
      // Giving them keys to satisfy the widget would put a bogus `field=` on
      // every request; the control simply does not apply here.
      filters={<ProposalMyRequestedResourcesFilter />}
      formId={ProposalMyRequestedResourcesFilterFormId}
    />
  );
};
