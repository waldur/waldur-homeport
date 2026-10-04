import { FC, useMemo } from 'react';
import {
  marketplaceOfferingMetricsList,
  OfferingMetric,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';
import {
  formatUnit,
  getKindLabel,
  getProjectAggregationOptions,
  getStateLabel,
  getStateVariant,
} from '@/marketplace/metrics/options';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { OfferingSectionProps } from '../types';

import {
  AdoptMetricButton,
  DefaultGoalAction,
  EditMetricAction,
  LifecycleActions,
} from './OfferingMetricActions';
import { ReportingCard } from './ReportingCard';

export const MetricsSection: FC<OfferingSectionProps> = (props) => {
  const filter = useMemo(
    () => ({ offering_uuid: props.offering.uuid }),
    [props.offering.uuid],
  );
  const tableProps = useTable<OfferingMetric>({
    table: 'OfferingMetricsList',
    fetchData: createFetcher(marketplaceOfferingMetricsList),
    filter,
  });
  const rows = tableProps.rows ?? [];

  return (
    <>
      <Table<OfferingMetric>
        {...tableProps}
        cardBordered={false}
        title={translate('Metrics')}
        subtitle={translate(
          'Custom metrics this offering reports for the projects that use it.',
        )}
        columns={[
          {
            title: translate('Metric'),
            render: ({ row }) => (
              <span className="text-dark fw-semibold">{row.name}</span>
            ),
          },
          {
            title: translate('Key'),
            render: ({ row }) => <code>{row.key}</code>,
          },
          {
            title: translate('Kind'),
            render: ({ row }) =>
              row.unit
                ? `${getKindLabel(row.kind)} · ${formatUnit(row.unit)}`
                : getKindLabel(row.kind),
          },
          {
            title: translate('Across a project'),
            render: ({ row }) =>
              getProjectAggregationOptions().find(
                (option) => option.value === row.project_aggregation,
              )?.label,
          },
          {
            title: translate('State'),
            render: ({ row }) => (
              <Badge
                variant={getStateVariant(row.state)}
                shape="pill"
                tone="outline"
              >
                {getStateLabel(row.state)}
              </Badge>
            ),
          },
        ]}
        verboseName={translate('metrics')}
        placeholderComponent={
          <NoResult
            callback={tableProps.fetch}
            title={translate('No metrics adopted')}
            message={translate(
              'Adopt metrics from the catalogue before a service reports any.',
            )}
            buttonTitle={translate('Search again')}
            className="mt-n5"
          />
        }
        hasQuery={false}
        minHeight="auto"
        rowActions={({ row }) => (
          <ActionsDropdown row={row} refetch={tableProps.fetch}>
            <EditMetricAction row={row} refetch={tableProps.fetch} />
            <DefaultGoalAction row={row} refetch={tableProps.fetch} />
            <LifecycleActions row={row} refetch={tableProps.fetch} />
          </ActionsDropdown>
        )}
        tableActions={
          <AdoptMetricButton
            offering={props.offering}
            refetch={tableProps.fetch}
          />
        }
      />
      <ReportingCard metrics={rows} />
    </>
  );
};
