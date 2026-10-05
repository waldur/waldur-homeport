import { FC } from 'react';
import {
  marketplaceMetricBreakdownList,
  ProjectMetric,
  ResourceMetric,
} from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import {
  formatFigure,
  formatMetricPeriod,
} from '@/marketplace/metrics/options';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

// The backend's name for breaking a project's figure down by its resources.
const BY_RESOURCE = 'resource';

interface Row {
  uuid: string;
  label: string;
  resourceUuid: string | null;
  value: number | null;
}

export const MetricBreakdownDialog: FC<{
  resolve: {
    item: ProjectMetric | ResourceMetric;
    projectUuid?: string;
    resourceUuid?: string;
    attribute: string;
  };
}> = ({ resolve: { item, projectUuid, resourceUuid, attribute } }) => {
  const metric = item.offering_metric;
  const isCounter = metric.kind === 'counter';
  const byResource = attribute === BY_RESOURCE;
  const title = byResource
    ? translate('Breakdown by resource')
    : translate('Breakdown by {attribute}', { attribute });
  const tableProps = useTable<Row>({
    table: `metric-breakdown-${metric.uuid}-${resourceUuid ?? projectUuid}-${attribute}`,
    fetchData: async () => {
      // The backend computes each value's figure the way the card does:
      // every series' total or latest level first, then combined.
      const { data } = await marketplaceMetricBreakdownList({
        query: {
          offering_metric_uuid: metric.uuid,
          ...(resourceUuid
            ? { resource_uuid: resourceUuid }
            : { project_uuid: projectUuid }),
          group_by: attribute,
          start: item.period_start,
        },
      });
      const rows = data.map((entry) => {
        const label = byResource
          ? entry.resource_name
          : String(entry.value ?? translate('Not set'));
        return {
          uuid: entry.resource_uuid ?? label,
          label,
          resourceUuid: entry.resource_uuid,
          value: entry.figure,
        };
      });
      return { rows, resultCount: rows.length };
    },
  });

  return (
    <ModalDialog
      title={title}
      subtitle={
        <>
          <ScopeSubtitle label={translate('Metric')} name={metric.name} />
          <div>
            <ScopeSubtitle
              label={translate('Period')}
              name={formatMetricPeriod(item.period, item.period_start)}
            />
          </div>
        </>
      }
    >
      <Table<Row>
        {...tableProps}
        columns={[
          {
            title: byResource ? translate('Resource') : attribute,
            render: ({ row }) =>
              row.resourceUuid ? (
                <Link
                  state="marketplace-resource-details"
                  params={{ resource_uuid: row.resourceUuid, tab: 'metrics' }}
                  label={row.label}
                  className="text-dark fw-semibold"
                />
              ) : (
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
        verboseName={byResource ? translate('resources') : attribute}
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
