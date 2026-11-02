import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  marketplacePublicOfferingsList,
  marketplaceResourcesList,
  OfferingComponent,
  Project,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { formatUsageValue } from '@/core/formatNumber';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { PercentProgress } from '@/core/PercentProgress';
import { translate } from '@/i18n';
import {
  formatQuotaUnits,
  getQuotaCellProps,
  RESOURCE_QUOTA_FIELDS,
} from '@/marketplace/resources/details/ResourceComponentItem';
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
  ...RESOURCE_QUOTA_FIELDS,
]);

// Stable fallback so the memoized columns are not rebuilt on every render
// while the offerings are not loaded.
const NO_OFFERINGS: PublicOfferingDetails[] = [];

// Components worth a usage figure: the ones metered or capped per resource.
// Fixed-price components carry no usage.
const isMeasuredComponent = (component: OfferingComponent) =>
  component.billing_type === 'limit' ||
  component.billing_type === 'usage' ||
  (component.billing_type === 'one' && component.is_prepaid);

interface ComponentQuota {
  component: OfferingComponent;
  usage: string | number;
  limit: string | number | null;
  units: string;
  percent: number | null;
}

const getComponentQuota = (
  component: OfferingComponent,
  row: Resource,
): ComponentQuota => {
  const { usage, limit, displayUnit, isTotal } = getQuotaCellProps(
    component,
    row,
  );
  // getQuotaCellProps gives "0" for a limit the resource does not store. Only
  // a positive limit counts, or any usage at all would read as 100% of it.
  const limitValue = Number(limit);
  const percent =
    limitValue > 0 ? Math.round((Number(usage) / limitValue) * 100) : null;
  return {
    component,
    usage,
    limit: limitValue > 0 ? limit : null,
    units: formatQuotaUnits(displayUnit, isTotal),
    percent: Number.isFinite(percent) ? percent : null,
  };
};

type QuotaOfferings = Pick<PublicOfferingDetails, 'uuid' | 'components'>[];

/**
 * The component a row shows: the one closest to its limit, as on the project
 * dashboard; one without a limit only when none has one. `count` is how many
 * the offering measures, so the cell can name the one it picked.
 */
const getResourceQuota = (row: Resource, offerings: QuotaOfferings) => {
  const quotas = (
    offerings.find((offering) => offering.uuid === row.offering_uuid)
      ?.components || []
  )
    .filter(isMeasuredComponent)
    .map((component) => getComponentQuota(component, row));
  // A stable sort, so components without a limit keep their offering order.
  const [quota] = [...quotas].sort(
    (a, b) => (b.percent ?? -1) - (a.percent ?? -1),
  );
  return { quota, count: quotas.length };
};

// Same thresholds as the dashboard's usage bar.
const getQuotaVariant = (percent: number) =>
  percent > 66 ? 'danger' : percent > 33 ? 'warning' : undefined;

interface QuotaCellProps {
  row: Resource;
  offerings: QuotaOfferings;
  isLoading: boolean;
}

/** Used of total, or the usage alone where the resource stores no limit. */
export const ResourceQuotaFigures: FC<QuotaCellProps> = ({
  row,
  offerings,
  isLoading,
}) => {
  if (isLoading) {
    return <LoadingSpinnerSimple />;
  }
  const { quota, count } = getResourceQuota(row, offerings);
  if (!quota) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  const figures =
    quota.limit !== null
      ? `${formatUsageValue(quota.usage)}/${formatUsageValue(quota.limit)}`
      : formatUsageValue(quota.usage);
  return (
    <>
      {count > 1 && (
        <span className="text-tertiary me-1.5">{quota.component.name}</span>
      )}
      {figures}
      {quota.units && ` ${quota.units}`}
    </>
  );
};

/** The same component's share of its limit, as a bar. */
export const ResourceQuotaBar: FC<QuotaCellProps> = ({
  row,
  offerings,
  isLoading,
}) => {
  if (isLoading) {
    return <LoadingSpinnerSimple />;
  }
  const { quota } = getResourceQuota(row, offerings);
  if (quota?.percent == null) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  return (
    <PercentProgress
      value={quota.percent}
      variant={getQuotaVariant(quota.percent)}
      label={quota.component.name}
      compact
    />
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
        title: translate('Used/total units'),
        render: ({ row }) => (
          <ResourceQuotaFigures
            row={row}
            offerings={offerings}
            isLoading={isLoading}
          />
        ),
        id: 'used',
      },
      {
        title: translate('Usage'),
        render: ({ row }) => (
          <ResourceQuotaBar
            row={row}
            offerings={offerings}
            isLoading={isLoading}
          />
        ),
        id: 'usage',
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
