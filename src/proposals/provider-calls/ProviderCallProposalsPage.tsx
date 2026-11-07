import { FC, useMemo } from 'react';
import {
  ProposalStates,
  proposalRequestedResourcesList,
  ProviderRequestedResource,
} from 'waldur-js-client';

import { HelpIcon, PropertyItem } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { ProposalBadge } from '@/proposals/proposal/ProposalBadge';
import { OFFERING_TEAM_PROPOSAL_STATE } from '@/proposals/proposal/proposalView';
import { formatProposalState } from '@/proposals/utils';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { formatDemandAmount } from './offeringDemand';
import { formatRequestedLimits, getRequestedLines } from './requestedLines';

/** One compact line per component, so a long request is never cut off. */
const RequestedCell: FC<{ row: ProviderRequestedResource }> = ({ row }) => {
  const lines = getRequestedLines(
    row.limits as Record<string, number>,
    row.requested_offering?.components,
  );
  if (!lines.length) {
    return <>{renderFieldOrDash(null)}</>;
  }
  return (
    <div className="flex flex-col">
      {lines.map((line) => (
        <span key={line.key} className="whitespace-nowrap">
          <span className="text-quaternary">{line.label}: </span>
          {formatDemandAmount(line.amount, line.unit)}
        </span>
      ))}
    </div>
  );
};

/** The resource the proposal's award provisioned, once there is one. */
const ProvisionedResourceRow: FC<{
  row: ProviderRequestedResource;
  providerUuid: string;
}> = ({ row, providerUuid }) => (
  <ExpandableContainer asTable>
    <PropertyItem label={translate('Resource')}>
      {row.resource_uuid ? (
        <Link
          state="marketplace-provider-resource-details"
          params={{ uuid: providerUuid, resource_uuid: row.resource_uuid }}
          label={row.resource_name || row.offering_name}
        />
      ) : (
        translate('Not provisioned yet')
      )}
    </PropertyItem>
    <PropertyItem
      label={translate('Resource state')}
      value={row.resource_state}
      hideIfEmpty={false}
    />
  </ExpandableContainer>
);

/**
 * The proposals requesting this provider's offerings, once submitted: what
 * each asks of which offering, where the proposal stands, and the resource
 * its award provisions.
 */
const ProviderCallProposalsTable: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const filter = useMemo(
    () => ({ provider_uuid: providerUuid, o: ['-created'] }),
    [providerUuid],
  );
  const tableProps = useTable({
    table: 'ProviderCallProposals',
    fetchData: createFetcher(proposalRequestedResourcesList),
    queryField: 'query',
    filter,
    exportFields: [
      translate('Proposal'),
      translate('State'),
      translate('Call'),
      translate('Round'),
      translate('Offering'),
      translate('Requested'),
      translate('Resource'),
      translate('Resource state'),
    ],
    exportRow: (row: ProviderRequestedResource) => [
      row.proposal_name,
      formatProposalState(row.proposal_state),
      row.call_name,
      row.round_name,
      row.offering_name,
      formatRequestedLimits(
        row.limits as Record<string, number>,
        row.requested_offering?.components,
      ),
      row.resource_name ?? '',
      row.resource_state ?? '',
    ],
  });

  // One component per provider, not per render: an inline component would
  // remount every expanded row on each render.
  const ExpandableRow = useMemo(
    () =>
      function ProviderProposalRow({
        row,
      }: {
        row: ProviderRequestedResource;
      }) {
        return <ProvisionedResourceRow row={row} providerUuid={providerUuid} />;
      },
    [providerUuid],
  );

  const columns: Column<ProviderRequestedResource>[] = [
    {
      title: translate('Proposal'),
      render: ({ row }) => (
        <div className="flex flex-col">
          {/* The offering's part of it: the proposal page narrows itself
              to what the provider may see. */}
          <Link
            state={OFFERING_TEAM_PROPOSAL_STATE}
            params={{
              uuid: providerUuid,
              proposal_uuid: row.proposal_uuid,
            }}
            label={row.proposal_name}
          />
          {row.proposal_slug ? (
            <span className="text-quaternary">{row.proposal_slug}</span>
          ) : null}
        </div>
      ),
      orderField: 'proposal__name',
    },
    {
      title: translate('State'),
      render: ({ row }) => (
        <ProposalBadge state={row.proposal_state as ProposalStates} />
      ),
      orderField: 'proposal__state',
      // A badge: its own width, leaving the room to the call's name.
      width: '120px',
    },
    {
      title: translate('Call'),
      render: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.call_name}</span>
          <span className="text-quaternary">{row.round_name}</span>
        </div>
      ),
      orderField: 'call__name',
      // Long call names wrap rather than push the table past its card.
      ellipsis: false,
    },
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.offering_name}</>,
      orderField: 'offering__name',
    },
    {
      title: translate('Requested'),
      render: RequestedCell,
      // One whole line per component: the cell widens rather than cut one.
      ellipsis: false,
    },
  ];

  return (
    <Table<ProviderRequestedResource>
      {...tableProps}
      columns={columns}
      title={
        <>
          {translate('Proposals')}{' '}
          <HelpIcon
            label={translate(
              'Expand a proposal to see the resource its award provisions.',
            )}
          />
        </>
      }
      subtitle={translate('Submitted proposals requesting your offerings.')}
      verboseName={translate('proposals')}
      emptyMessage={translate(
        'No submitted proposal requests an offering of this provider yet.',
      )}
      hasQuery
      enableExport
      expandableRow={ExpandableRow}
      // The proposal's name is no wider a column than the call's: doubled,
      // it squeezed the call's name onto four lines.
      equalColWidth
    />
  );
};

export const ProviderCallProposalsPage: FC = () => {
  const customer = useCustomer();
  if (!customer) {
    return null;
  }
  return <ProviderCallProposalsTable providerUuid={customer.uuid} />;
};
