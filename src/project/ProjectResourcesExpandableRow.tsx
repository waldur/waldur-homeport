import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { FC, useMemo } from 'react';
import {
  marketplacePublicOfferingsList,
  marketplaceResourcesList,
  OfferingComponent,
  Project,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { Popover, PopoverContent, PopoverTrigger } from 'waldur-ui';

import { UI_STALE_TIME } from '@/core/constants';
import { formatUsageValue } from '@/core/formatNumber';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { QuotaProgressBar } from '@/marketplace/resources/details/QuotaProgressBar';
import { getQuotaCellProps } from '@/marketplace/resources/details/ResourceComponentItem';
import { NON_TERMINATED_STATES } from '@/marketplace/resources/list/constants';
import { ResourceNameField } from '@/marketplace/resources/list/ResourceNameField';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { resourcesListRequiredFields } from '@/marketplace/resources/list/utils';
import { getOfferingComponentsKey } from '@/project/dashboard/offeringComponentsKey';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

const mandatoryFields = resourcesListRequiredFields(false).concat([
  'offering_uuid',
  'offering_name',
  'offering_type',
  'limits',
  'limit_usage',
  'display_limits',
  'current_usages',
]);

// Stable fallback so the memoized columns are not rebuilt on every render
// while the offerings are not loaded.
const NO_OFFERINGS: PublicOfferingDetails[] = [];

// Components worth a usage/limit figure: the ones metered or capped per
// resource. Fixed-price components carry no usage.
const isMeasuredComponent = (component: OfferingComponent) =>
  component.billing_type === 'limit' ||
  component.billing_type === 'usage' ||
  (component.billing_type === 'one' && component.is_prepaid);

interface ComponentUsage {
  component: OfferingComponent;
  usage: string | number;
  limit: string | number | null;
  displayUnit: string;
  percent: number | null;
}

const getComponentUsage = (
  component: OfferingComponent,
  row: Resource,
): ComponentUsage => {
  const { usage, limit, displayUnit } = getQuotaCellProps(component, row);
  // getQuotaCellProps gives "0" for a limit the resource does not store, so
  // only a positive limit counts; otherwise 0 / 0 would show as "NaN%".
  const hasLimit = Number(limit) > 0;
  const percent = hasLimit
    ? Math.round((Number(usage) / Number(limit)) * 100)
    : null;
  return {
    component,
    usage,
    limit: hasLimit ? limit : null,
    displayUnit,
    percent: Number.isFinite(percent) ? percent : null,
  };
};

const formatFigures = (item: ComponentUsage) =>
  (item.limit !== null
    ? `${formatUsageValue(item.usage)} / ${formatUsageValue(item.limit)}`
    : formatUsageValue(item.usage)) +
  (item.displayUnit ? ` ${item.displayUnit}` : '');

// Same thresholds as QuotaProgressBar, for figures shown without a bar.
const getFiguresClassName = (percent: number | null) =>
  percent === null || percent < 33
    ? undefined
    : percent < 66
      ? 'text-warning'
      : 'text-danger';

const UsageLine: FC<{ item: ComponentUsage }> = ({ item }) => (
  <>
    <span className="text-tertiary truncate" title={item.component.name}>
      {item.component.name}
    </span>
    {item.percent !== null ? (
      <QuotaProgressBar
        percent={Math.min(item.percent, 100)}
        size="xs"
        label={item.component.name}
      />
    ) : (
      <span />
    )}
    <span className="text-nowrap">
      {formatFigures(item)}
      {item.percent !== null && (
        <span className="text-tertiary ms-1">({item.percent}%)</span>
      )}
    </span>
  </>
);

// Fixed label and bar widths, so bars and figures line up across components
// and across the resource rows, each of which renders its own grid.
const usageGridClassName =
  'grid grid-cols-[9rem_5rem_auto] items-center gap-x-3 gap-y-1 text-xs';

// Two components fit on one line within the standard row height.
const INLINE_COMPONENTS = 2;

export const ResourceUsageLimits: FC<{
  row: Resource;
  offerings: Pick<PublicOfferingDetails, 'uuid' | 'components'>[];
  isLoading: boolean;
}> = ({ row, offerings, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinnerSimple />;
  }
  // Closest to its limit first, so the inline summary shows what matters;
  // components without a limit keep their offering order after them.
  const items = (
    offerings.find((offering) => offering.uuid === row.offering_uuid)
      ?.components || []
  )
    .filter(isMeasuredComponent)
    .map((component) => getComponentUsage(component, row))
    .sort((a, b) => (b.percent ?? -1) - (a.percent ?? -1));
  if (!items.length) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  const hiddenCount = items.length - INLINE_COMPONENTS;
  return (
    // Fixed name and minimum figure widths line the components up across rows.
    <div className="flex items-center gap-2 text-xs text-nowrap">
      {items.slice(0, INLINE_COMPONENTS).map((item, index) => (
        <span key={item.component.type} className="flex items-center gap-2">
          {index > 0 && <span className="text-tertiary">·</span>}
          <span
            className="text-tertiary w-28 truncate"
            title={item.component.name}
          >
            {item.component.name}
          </span>
          <span
            className={classNames(
              'min-w-28',
              getFiguresClassName(item.percent),
            )}
          >
            {formatFigures(item)}
          </span>
        </span>
      ))}
      {hiddenCount > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="text-brand cursor-pointer">
              {translate('+{count} more', { count: hiddenCount })}
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            sideOffset={4}
            className="p-3 max-h-(--radix-popover-content-available-height) overflow-y-auto"
          >
            <div className={usageGridClassName}>
              {items.map((item) => (
                <UsageLine key={item.component.type} item={item} />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

const ProjectResourcesTable: FC<{ projectUuid: string }> = ({
  projectUuid,
}) => {
  const filter = useMemo(
    () => ({ project_uuid: projectUuid, state: NON_TERMINATED_STATES }),
    [projectUuid],
  );

  const tableProps = useTable({
    table: `project-resources-${projectUuid}`,
    fetchData: createFetcher(marketplaceResourcesList),
    filter,
    mandatoryFields,
  });

  // Components of the offerings behind the resources on this page, needed to
  // label and scale each resource's usage and limit figures.
  const componentsKey = useMemo(
    () => getOfferingComponentsKey(tableProps.rows),
    [tableProps.rows],
  );
  // Own key: ProjectLimitUsageBasedResources caches the same offerings under
  // 'offerings-components' with plans, which this query does not fetch.
  const { data: offerings = NO_OFFERINGS, isLoading } = useQuery({
    queryKey: ['offerings-components-usage', ...componentsKey],
    queryFn: () =>
      marketplacePublicOfferingsList({
        query: {
          uuid_list: componentsKey.join(','),
          field: ['uuid', 'components'],
          page_size: componentsKey.length,
        },
      }).then((response) => response.data),
    enabled: componentsKey.length > 0,
    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });

  const columns = useMemo<Column<Resource>[]>(
    () => [
      {
        title: translate('Resource name'),
        render: ResourceNameField,
        id: 'name',
      },
      {
        title: translate('Offering'),
        render: ({ row }) => <>{row.offering_name}</>,
        id: 'offering',
      },
      {
        title: translate('State'),
        render: ({ row }) => (
          <ResourceStateField resource={row} shape="pill" tone="outline" />
        ),
        id: 'state',
      },
      {
        title: translate('Usage / limit'),
        render: ({ row }) => (
          <ResourceUsageLimits
            row={row}
            offerings={offerings}
            isLoading={isLoading}
          />
        ),
        id: 'usage',
        // The summary must not be clipped; the column grows to fit it.
        ellipsis: false,
      },
    ],
    [offerings, isLoading],
  );

  return (
    <Table<Resource>
      {...tableProps}
      columns={columns}
      verboseName={translate('resources')}
      emptyMessage={translate('This project has no active resources.')}
      placeholderHasRetry={false}
      minHeight="auto"
      hideTitle
      hasActionBar={false}
    />
  );
};

export const ProjectResourcesExpandableRow: FC<{ row: Project }> = ({
  row,
}) => (
  <ExpandableContainer>
    <ProjectResourcesTable projectUuid={row.uuid} />
  </ExpandableContainer>
);
