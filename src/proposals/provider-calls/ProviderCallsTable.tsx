import { FC, useMemo } from 'react';
import {
  proposalRequestedOfferingsList,
  ProviderRequestedOffering,
  proposalRequestedOfferingsFacetsList,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { CALL_STATE_VARIANT } from '@/proposals/call-tabs';
import { CallOfferingStateField } from '@/proposals/details/CallOfferingStateField';
import { withRequestedOfferingUuids } from '@/proposals/offering-requests/requestedOfferingFilterValues';
import {
  formatCallOfferingState,
  formatCallState,
  getRoundStatus,
} from '@/proposals/utils';
import { createFetcher } from '@/table/api';
import {
  ProposalRequestedOfferingsFilter,
  selectProposalRequestedOfferingsFilter,
} from '@/table/generated/ProposalRequestedOfferingsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { OfferingTeamStepsRow } from './OfferingTeamStepsRow';
import { makeProviderCallRowActions } from './ProviderCallRowActions';
import { needsOfferingManagers } from './providerCalls';

// Counts what each filter can still take; see '@/table/facets'.
const requestedOfferingFacets = { fetch: proposalRequestedOfferingsFacetsList };

/**
 * The call's name, linked to its public page. A draft call has none yet:
 * only its managers can open it, so its name stays plain text.
 */
export const CallNameLink: FC<{ row: ProviderRequestedOffering }> = ({
  row,
}) =>
  row.call_state === 'draft' ? (
    <span className="font-medium text-primary">{row.call_name}</span>
  ) : (
    <Link
      state="public-call.details"
      params={{ call_uuid: row.call_uuid }}
      label={row.call_name}
      className="font-medium"
    />
  );

const CallCell: FC<{ row: ProviderRequestedOffering }> = ({ row }) => (
  <div className="flex flex-col items-start gap-1">
    <CallNameLink row={row} />
    <span className="text-quaternary">{row.call_managing_organisation}</span>
    <Badge
      variant={CALL_STATE_VARIANT[row.call_state] || 'secondary'}
      size="sm"
      shape="pill"
      tone="outline"
    >
      {formatCallState(row.call_state)}
    </Badge>
  </div>
);

export const CurrentRoundCell: FC<{ row: ProviderRequestedOffering }> = ({
  row,
}) => {
  const status = getRoundStatus(row.current_round);
  if (!row.current_round || !status) {
    return <>{renderFieldOrDash(null)}</>;
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <span>{row.current_round.name}</span>
      <Badge variant={status.color} size="sm" shape="pill" tone="outline">
        {status.label}
      </Badge>
    </div>
  );
};

export const CutoffCell: FC<{ row: ProviderRequestedOffering }> = ({ row }) => (
  <>
    {row.current_round?.cutoff_time
      ? formatDateTime(row.current_round.cutoff_time)
      : renderFieldOrDash(null)}
  </>
);

/** The offering's managers; a zero the call cannot work with is flagged. */
const OfferingManagersCell: FC<{ row: ProviderRequestedOffering }> = ({
  row,
}) => (
  <div className="flex items-center gap-1.5">
    <span>{row.offering_managers_count}</span>
    {needsOfferingManagers(row) ? (
      <Badge variant="danger" size="sm" shape="pill" tone="outline">
        {translate('Needed')}
      </Badge>
    ) : null}
  </div>
);

interface ProviderCallsTableProps {
  providerUuid: string;
  /** Narrows the list to one offering, and drops the offering column. */
  offeringUuid?: string;
  title?: string;
}

/**
 * The calls the provider's offerings are in: where each call stands, its
 * current round and cut-off, the proposals requesting the offering, and
 * whether the offering has the managers the call's workflow hands work to.
 */
export const ProviderCallsTable: FC<ProviderCallsTableProps> = ({
  providerUuid,
  offeringUuid,
  title,
}) => {
  const table = offeringUuid
    ? `ProviderOfferingCalls-${offeringUuid}`
    : 'ProviderCalls';
  const values = useFilterValues(table);
  const formFilters = useMemo(
    () =>
      offeringUuid
        ? {}
        : selectProposalRequestedOfferingsFilter(
            withRequestedOfferingUuids(values),
          ),
    [offeringUuid, values],
  );
  const filter = useMemo(
    () => ({
      ...(offeringUuid
        ? { offering_uuid: offeringUuid }
        : { provider_uuid: providerUuid }),
      // A rejected request is no call the offering is in; it stays listed
      // under Requests for offerings.
      state: ['requested', 'accepted'],
      o: ['-created'],
      ...formFilters,
    }),
    [providerUuid, offeringUuid, formFilters],
  );

  const tableProps = useTable({
    table,
    syncFiltersToURL: !offeringUuid,
    fetchData: createFetcher(proposalRequestedOfferingsList),
    facets: requestedOfferingFacets,
    queryField: 'call_name',
    filter,
    exportFields: [
      translate('Call'),
      translate('Call organizer'),
      translate('Offering'),
      translate('Request'),
      translate('Call state'),
      translate('Current round'),
      translate('Cut-off'),
      translate('Proposals'),
      translate('Offering managers'),
      translate('Steps for the offering team'),
    ],
    exportRow: (row: ProviderRequestedOffering) => [
      row.call_name,
      row.call_managing_organisation,
      row.offering_name,
      formatCallOfferingState(row.state),
      formatCallState(row.call_state),
      row.current_round?.name ?? '',
      row.current_round?.cutoff_time
        ? formatDateTime(row.current_round.cutoff_time)
        : '',
      String(row.proposals_count),
      String(row.offering_managers_count),
      String(row.team_steps_count),
    ],
  });

  // One component per provider, not per render: an inline component would
  // remount every expanded row, and refetch its steps, on each render.
  const ExpandableRow = useMemo(
    () =>
      function ProviderCallRow({
        row,
        fetch,
      }: {
        row: ProviderRequestedOffering;
        fetch: () => void;
      }) {
        return (
          <OfferingTeamStepsRow
            row={row}
            providerUuid={providerUuid}
            fetch={fetch}
          />
        );
      },
    [providerUuid],
  );

  const RowActions = useMemo(
    () => makeProviderCallRowActions(providerUuid),
    [providerUuid],
  );

  const columns: Column<ProviderRequestedOffering>[] = [
    { title: translate('Call'), render: CallCell, orderField: 'call__name' },
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.offering_name}</>,
      orderField: 'offering__name',
      visible: !offeringUuid,
    },
    {
      title: translate('Request'),
      render: CallOfferingStateField,
      orderField: 'state',
    },
    { title: translate('Current round'), render: CurrentRoundCell },
    { title: translate('Cut-off'), render: CutoffCell },
    {
      title: translate('Proposals'),
      render: ({ row }) => <>{row.proposals_count}</>,
    },
    { title: translate('Offering managers'), render: OfferingManagersCell },
  ];

  return (
    <Table<ProviderRequestedOffering>
      {...tableProps}
      columns={columns.filter((column) => column.visible !== false)}
      title={title ?? translate('Calls')}
      verboseName={translate('calls')}
      hasQuery
      enableExport
      emptyMessage={translate(
        'No call has requested an offering of this provider yet.',
      )}
      expandableRow={ExpandableRow}
      rowActions={RowActions}
      filters={offeringUuid ? undefined : <ProposalRequestedOfferingsFilter />}
    />
  );
};
