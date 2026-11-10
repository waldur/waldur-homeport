import { translate } from 'waldur-i18n-runtime';
import { OfferingDemand } from 'waldur-js-client';
import { DataTableColumn } from 'waldur-ui';

import { PageHeader, QueryTableCard, withRows } from '../components';
import { DASH, formatAmount, formatDate } from '../format';
import { Provider } from '../providers';
import { useOfferingDemand } from '../queries';

/**
 * One row per offering, call and round: proposals still being decided,
 * accepted and closed, with what they request and what was awarded against
 * the call's pools. The endpoint returns the three state groups as separate
 * rows; they are folded into one here.
 */
interface DemandRow {
  key: string;
  offering: string;
  call: string;
  round: string;
  cutoff: string | null;
  pending: number;
  accepted: number;
  closed: number;
  components: Map<
    string,
    { name: string; unit: string; requested: number; awarded: number }
  >;
}

const fold = (rows: OfferingDemand[]): DemandRow[] => {
  const byKey = new Map<string, DemandRow>();
  for (const row of rows) {
    const key = `${row.requested_offering_uuid}:${row.round_uuid}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        offering: row.offering_name,
        call: row.call_name,
        round: row.round_name,
        cutoff: row.round_cutoff_time,
        pending: 0,
        accepted: 0,
        closed: 0,
        components: new Map(),
      });
    }
    const folded = byKey.get(key);
    folded[row.state_group] += row.proposals_count;
    for (const component of row.components ?? []) {
      const sum = folded.components.get(component.type) ?? {
        name: component.name,
        unit: component.measured_unit,
        requested: 0,
        awarded: 0,
      };
      sum.requested += component.requested;
      sum.awarded += component.awarded ?? 0;
      folded.components.set(component.type, sum);
    }
  }
  return [...byKey.values()];
};

export const DemandPage = ({ provider }: { provider?: Provider }) => {
  const query = useOfferingDemand(provider?.uuid);
  const folded = withRows(query, query.data ? fold(query.data) : undefined);

  const columns: DataTableColumn<DemandRow>[] = [
    {
      key: 'offering',
      header: translate('Offering'),
      render: (row) => row.offering,
    },
    {
      key: 'call',
      header: translate('Call and round'),
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.call}</span>
          <span className="text-xs text-quaternary">
            {row.round}
            {row.cutoff
              ? ` · ${translate('cut-off {date}', { date: formatDate(row.cutoff) })}`
              : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'proposals',
      header: translate('Proposals'),
      render: (row) =>
        translate('{pending} pending · {accepted} accepted · {closed} closed', {
          pending: row.pending,
          accepted: row.accepted,
          closed: row.closed,
        }),
    },
    {
      key: 'components',
      header: translate('Requested / awarded'),
      render: (row) =>
        row.components.size === 0 ? (
          DASH
        ) : (
          <div className="flex flex-col">
            {[...row.components.values()].map((component) => (
              <span key={component.name}>
                {component.name}:{' '}
                {formatAmount(component.requested, component.unit)} /{' '}
                {formatAmount(component.awarded, component.unit)}
              </span>
            ))}
          </div>
        ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title={translate('Demand')}
        description={translate(
          'How much the calls ask of your offerings, and how much they award.',
        )}
      />
      <QueryTableCard
        query={folded}
        columns={columns}
        rowKey={(row) => row.key}
        emptyMessage={translate(
          'No call has proposals for your offerings yet.',
        )}
      />
    </div>
  );
};
