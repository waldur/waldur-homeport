import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  NestedRound,
  OfferingDemand,
  proposalOfferingDemandList,
} from 'waldur-js-client';

import { Badge, HelpIcon } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { getRoundStatus } from '@/proposals/utils';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import {
  ProposalOfferingDemandFilter,
  selectProposalOfferingDemandFilter,
} from '@/table/generated/ProposalOfferingDemandFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import {
  componentRows,
  DemandComponentRow,
  DemandRoundRow,
  describePoolLeft,
  formatDemandAmount,
  groupDemandRows,
  roundOptions,
} from './offeringDemand';

const TABLE = 'ProviderCallDemand';

/** The call's name, linked to its public page once it has one. */
const CallCell: FC<{ row: DemandRoundRow }> = ({ row }) =>
  row.call_state === 'draft' ? (
    <>{row.call_name}</>
  ) : (
    <Link
      state="public-call.details"
      params={{ call_uuid: row.call_uuid }}
      label={row.call_name}
    />
  );

const RoundCell: FC<{ row: DemandRoundRow }> = ({ row }) => {
  const status = getRoundStatus({ status: row.round_status } as NestedRound);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span>{row.round_name}</span>
      {status ? (
        <Badge variant={status.color} size="sm" shape="pill" tone="outline">
          {status.label}
        </Badge>
      ) : null}
    </div>
  );
};

const count = (group: OfferingDemand | null) =>
  group?.proposals_count ? String(group.proposals_count) : DASH;

const DASH = renderFieldOrDash(null) as string;

const amount = (value: number | null) =>
  value ? formatDemandAmount(value) : DASH;

/** Per component: what the round's proposals ask and were awarded, and
 * what the call's pools have left. */
export const DemandComponentsRow: FC<{ row: DemandRoundRow }> = ({ row }) => {
  const components = useMemo(() => componentRows(row), [row]);
  const tableProps = useTable({
    table: `${TABLE}-components-${row.key}`,
    fetchData: () =>
      Promise.resolve({ rows: components, resultCount: components.length }),
  });
  return (
    <ExpandableContainer>
      <Table<DemandComponentRow>
        {...tableProps}
        minHeight="auto"
        columns={[
          {
            title: translate('Component'),
            render: ({ row: component }) => (
              <>
                <span className="font-medium text-primary">
                  {component.label}
                </span>
                {component.unit ? (
                  <span className="text-tertiary"> ({component.unit})</span>
                ) : null}
              </>
            ),
          },
          {
            title: translate('Pending, requested'),
            render: ({ row: component }) => (
              <>{amount(component.pendingRequested)}</>
            ),
          },
          {
            title: translate('Accepted, requested'),
            render: ({ row: component }) => (
              <>{amount(component.acceptedRequested)}</>
            ),
          },
          {
            title: translate('Awarded'),
            render: ({ row: component }) => <>{amount(component.awarded)}</>,
          },
          {
            title: translate('Round pool'),
            render: ({ row: component }) => (
              <>
                {component.roundPool
                  ? describePoolLeft(component.roundPool)
                  : DASH}
              </>
            ),
          },
          {
            title: translate('Call pool'),
            render: ({ row: component }) => (
              <>
                {component.callPool
                  ? describePoolLeft(component.callPool)
                  : DASH}
              </>
            ),
          },
        ]}
        verboseName={translate('components')}
        emptyMessage={translate('No amounts were asked for in this round.')}
        hideTitle
        hasActionBar={false}
        placeholderHasRetry={false}
      />
    </ExpandableContainer>
  );
};

/** "GPU Hours: pending 25K, accepted 30K, awarded 20K", for the export. */
const describeComponents = (row: DemandRoundRow) =>
  componentRows(row)
    .map((component) =>
      [
        `${component.label}${component.unit ? ` (${component.unit})` : ''}:`,
        translate('pending {pending}, accepted {accepted}, awarded {awarded}', {
          pending: amount(component.pendingRequested),
          accepted: amount(component.acceptedRequested),
          awarded: amount(component.awarded),
        }),
      ].join(' '),
    )
    .join('; ');

/**
 * How much the proposals of each call ask of the provider's offerings,
 * round by round: pending and accepted side by side, with the call's pools.
 */
const ProviderCallDemandTable: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const values = useFilterValues(TABLE);
  const filter = useMemo(
    () => ({
      ...selectProposalOfferingDemandFilter(values),
      provider_uuid: providerUuid,
    }),
    [values, providerUuid],
  );
  // Every round the provider has demand in, for the round filter.
  const { data: everyRow } = useQuery({
    queryKey: ['ProviderCallDemandRounds', providerUuid],
    queryFn: async () =>
      (
        await proposalOfferingDemandList({
          query: { provider_uuid: providerUuid },
        })
      ).data,
    staleTime: 60 * 1000,
  });
  const rounds = useMemo(() => roundOptions(everyRow ?? []), [everyRow]);

  const tableProps = useTable({
    table: TABLE,
    fetchData: async (request) => {
      const { data } = await proposalOfferingDemandList({
        query: request.filter,
      });
      const rows = groupDemandRows(data);
      return { rows, resultCount: rows.length };
    },
    filter,
    syncFiltersToURL: true,
    exportFields: [
      translate('Offering'),
      translate('Call'),
      translate('Round'),
      translate('Cut-off'),
      translate('Pending'),
      translate('Accepted'),
      translate('Closed'),
      translate('Components'),
    ],
    exportRow: (row: DemandRoundRow) => [
      row.offering_name,
      row.call_name,
      row.round_name,
      row.round_cutoff_time ? formatDateTime(row.round_cutoff_time) : '',
      count(row.pending),
      count(row.accepted),
      count(row.closed),
      describeComponents(row),
    ],
  });

  const columns: Column<DemandRoundRow>[] = [
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.offering_name}</>,
    },
    { title: translate('Call'), render: CallCell },
    { title: translate('Round'), render: RoundCell },
    {
      title: translate('Cut-off'),
      render: ({ row }) => (
        <>
          {row.round_cutoff_time
            ? formatDateTime(row.round_cutoff_time)
            : renderFieldOrDash(null)}
        </>
      ),
    },
    {
      title: translate('Pending'),
      render: ({ row }) => <>{count(row.pending)}</>,
    },
    {
      title: translate('Accepted'),
      render: ({ row }) => <>{count(row.accepted)}</>,
    },
    {
      title: translate('Closed'),
      render: ({ row }) => <>{count(row.closed)}</>,
    },
  ];

  return (
    <Table<DemandRoundRow>
      {...tableProps}
      columns={columns}
      title={
        <>
          {translate('Demand')}{' '}
          <HelpIcon
            label={translate(
              'Pending: submitted or in review. Closed: rejected or canceled. Amounts are in each component’s unit, per its limit period as requested; a pool counts each award over its whole length.',
            )}
          />
        </>
      }
      subtitle={translate(
        'Proposals asking for your offerings, by call and round. Expand a round for the amounts per component.',
      )}
      verboseName={translate('rounds')}
      emptyMessage={translate(
        'No submitted proposal asks for an offering of this provider yet.',
      )}
      filters={
        <ProposalOfferingDemandFilter
          providerUuid={providerUuid}
          roundOptions={rounds}
        />
      }
      expandableRow={DemandComponentsRow}
      hasPagination={false}
      hasQuery={false}
      enableExport
    />
  );
};

export const ProviderCallDemandPage: FC = () => {
  const customer = useCustomer();
  if (!customer) {
    return null;
  }
  return <ProviderCallDemandTable providerUuid={customer.uuid} />;
};
