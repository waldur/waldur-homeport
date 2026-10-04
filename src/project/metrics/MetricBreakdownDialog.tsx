import { FC } from 'react';
import {
  marketplaceMetricBreakdownList,
  ProjectMetric,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { formatFigure } from '@/marketplace/metrics/options';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface Row {
  uuid: string;
  label: string;
  value: number | null;
}

export const MetricBreakdownDialog: FC<{
  resolve: { item: ProjectMetric; projectUuid: string; attribute: string };
}> = ({ resolve: { item, projectUuid, attribute } }) => {
  const metric = item.offering_metric;
  const isCounter = metric.kind === 'counter';
  const tableProps = useTable<Row>({
    table: `metric-breakdown-${metric.uuid}-${attribute}`,
    fetchData: async () => {
      // The backend computes each value's figure the way the card does:
      // every series' total or latest level first, then combined.
      const { data } = await marketplaceMetricBreakdownList({
        query: {
          offering_metric_uuid: metric.uuid,
          project_uuid: projectUuid,
          group_by: attribute,
          start: item.period_start,
        },
      });
      const rows = data.map((entry) => {
        const label = String(entry.value ?? translate('Not set'));
        return { uuid: label, label, value: entry.figure };
      });
      return { rows, resultCount: rows.length };
    },
  });

  return (
    <ModalDialog
      title={translate('Breakdown by {attribute}', { attribute })}
      subtitle={
        <ScopeSubtitle label={translate('Metric')} name={metric.name} />
      }
    >
      <Table<Row>
        {...tableProps}
        columns={[
          {
            title: attribute,
            render: ({ row }) => (
              <span className="text-dark fw-semibold">{row.label}</span>
            ),
          },
          {
            title: isCounter ? translate('Total') : translate('Latest value'),
            render: ({ row }) => formatFigure(row.value, metric.unit),
          },
        ]}
        fullWidth
        equalColWidth
        verboseName={attribute}
        hasPagination={false}
        hideTitle
        hasActionBar={false}
        hoverShadow={false}
        minHeight="auto"
        cardBordered={false}
        bodyClassName="p-0"
        placeholderHasRetry={false}
      />
    </ModalDialog>
  );
};
