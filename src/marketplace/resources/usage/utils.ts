import { DateTime } from 'luxon';
import {
  PublicOfferingDetails,
  marketplaceResourcesOfferingRetrieve,
  marketplaceComponentUserUsagesList,
  marketplaceComponentUsagesList,
  OfferingComponent,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { parseDate } from '@/core/dateUtils';
import { formatUsageValue } from '@/core/formatNumber';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { getAccountingTypeOptions } from '@/marketplace/offerings/update/components/ComponentAccountingTypeField';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { renderFieldOrDash } from '@/table/utils';

import { ComponentUsage, ComponentUserUsage } from './types';

/** Distance from the cursor point in x and y */
const TOOLTIP_OFFSET = 4;
const MAX_SHOW_ITEMS = 5;

interface RowData {
  value: number;
  description: string;
  details?: Array<any>;
}

const formatChart = (
  name: string,
  color: string,
  labels: string[],
  usages: RowData[],
  limits: RowData[] = [],
  openDialog?: (details) => void,
  alwaysShowLimit: boolean = false,
) => {
  const limitSeriesName = translate('Limit');
  const showLimitSeries = alwaysShowLimit || limits.some((l) => l.value > 0);
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
      enterable: true,
      renderMode: 'html',
      appendToBody: true,
      position: (point, _, __, ___, size) => {
        const x = point[0];
        const y = point[1];
        const tipW = size.contentSize[0];
        const tipH = size.contentSize[1];
        const viewW = size.viewSize[0];
        const viewH = size.viewSize[1];

        let pointX = x + TOOLTIP_OFFSET;
        let pointY = y + TOOLTIP_OFFSET;
        if (x + tipW > viewW) {
          pointX = x - tipW - TOOLTIP_OFFSET;
        }
        if (y + tipH > viewH) {
          pointY = y - tipH - TOOLTIP_OFFSET;
        }

        return [pointX, pointY];
      },
      formatter: (params) => {
        const date = params[0].axisValue;
        let tooltip = `<div class="mb-1"><b>${date}</b></div>`;

        params.forEach((param) => {
          const val = param.data.value;
          const description = param.data.description;
          const details: RowData['details'] = param.data.details;

          if (param.seriesName === limitSeriesName && !val) {
            return;
          }

          tooltip += `<br/>${param.marker} ${param.seriesName}: <b>${formatUsageValue(val, true, 2)}</b>`;
          if (description) {
            tooltip += ` (${description})`;
          }

          if (details?.length) {
            tooltip += `<br/><div class="mt-2 text-decoration-underline"><b>${translate('Details')}:</b></div>`;
            tooltip += `<ul class="mb-0">`;
            const hasMoreBtn =
              details.length > MAX_SHOW_ITEMS + 1 && Boolean(openDialog);
            const len = hasMoreBtn ? MAX_SHOW_ITEMS : Infinity;
            details.slice(0, len).forEach((d) => {
              tooltip += `<li>${d.username} - ${formatUsageValue(d.usage, true, 2)} ${d.measured_unit}</li>`;
            });
            tooltip += `</ul>`;

            if (hasMoreBtn) {
              tooltip += `<div class="text-center mt-3">`;
              tooltip += `<button id="see-more-btn" class="btn btn-link btn-icon-right py-0">${translate('See more')}`;
              tooltip += `<span class="svg-icon svg-icon-2 svg-icon-primary"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm48.49-108.49a12,12,0,0,1,0,17l-40,40a12,12,0,0,1-17,0l-40-40a12,12,0,0,1,17-17L128,135l31.51-31.52A12,12,0,0,1,176.49,103.51Z"></path></svg></span>`;
              tooltip += `</button></div>`;

              setTimeout(() => {
                const btn = document.getElementById('see-more-btn');
                if (btn) {
                  btn.onclick = () => openDialog(details);
                }
              }, 100);
            }
          }
        });

        return tooltip;
      },
    },
    xAxis: [
      {
        type: 'category',
        data: labels,
        axisPointer: {
          type: 'shadow',
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name,
        axisLabel: {
          formatter: (value: number) => formatUsageValue(value, true, 2),
        },
        axisLine: { show: true },
        axisTick: { show: true },
      },
    ],
    series: [
      ...(showLimitSeries
        ? [
            {
              type: 'bar',
              name: limitSeriesName,
              data: limits,
              color: '#e0e0e0', // Light gray for limit bars
              barMaxWidth: 50,
            },
          ]
        : []),
      {
        type: 'bar',
        name: translate('Usage'),
        data: usages,
        color,
        barMaxWidth: 50,
      },
    ],
  };
};

const getMonthsPeriods = (months): DateTime[] => {
  const periods = [];
  for (let i = months - 1; i >= 0; i--) {
    periods.push(DateTime.now().minus({ months: i }));
  }
  return periods;
};

export const getFormattedUsages = (
  periods: DateTime[],
  usages: Pick<
    ComponentUsage,
    'billing_period' | 'description' | 'total_consumed' | 'usage'
  >[],
  userUsages: Pick<
    ComponentUserUsage,
    'component_type' | 'billing_period'
  >[] = [],
  valueSelector: (
    usage: Pick<
      ComponentUsage,
      | 'billing_period'
      | 'description'
      | 'total_consumed'
      | 'total_allocated'
      | 'usage'
    >,
  ) => number = (u) => u.total_consumed || u.usage,
): RowData[] => {
  return periods.map((period) => {
    const matchingUsage = usages.find(
      (usage) =>
        parseDate(usage.billing_period).toFormat('yyyy-MM') ===
        period.toFormat('yyyy-MM'),
    );

    if (matchingUsage) {
      const details = userUsages.filter(
        (usage) =>
          parseDate(usage.billing_period).toFormat('yyyy-MM') ===
          period.toFormat('yyyy-MM'),
      );

      return {
        value: valueSelector(matchingUsage) || 0,
        description: matchingUsage.description,
        details,
      };
    }

    return {
      value: 0,
      description: '',
      details: [],
    };
  });
};

export const getUsagePeriods = (
  usages: Pick<ComponentUsage, 'billing_period'>[],
  months: number = null,
) => {
  let numberOfMonths = months;
  if (!numberOfMonths) {
    // Calculate number of months from usages, if months param is not given
    const startDateUnix = Math.min(
      ...usages.map((usage) => new Date(usage.billing_period).getTime()),
    );
    const _months = parseDate(startDateUnix)
      .startOf('month')
      .diffNow()
      .as('months');
    numberOfMonths = Math.ceil(Math.abs(_months));
  }
  const periods = getMonthsPeriods(numberOfMonths);
  const labels = periods.map((date) => date.toFormat('LLLL yyyy'));
  return { periods, labels };
};

export const getEChartOptions = (
  component: Pick<OfferingComponent, 'type' | 'measured_unit' | 'billing_type'>,
  usages: any[],
  userUsages: Pick<ComponentUserUsage, 'component_type' | 'billing_period'>[],
  months: number,
  color: string,
  openDialog?: (userUsage: ComponentUserUsage[]) => void,
) => {
  const { labels, periods } = getUsagePeriods(usages, months);
  const filteredUsages = usages.filter(
    (usage) => (usage.component_type || usage.type) === component.type,
  );
  const filteredUserUsages = userUsages?.filter(
    (usage) => usage.component_type === component.type,
  );

  const formattedUsages = getFormattedUsages(
    periods,
    filteredUsages,
    filteredUserUsages,
    (u) => u.total_consumed || u.usage,
  );

  const formattedLimits = getFormattedUsages(
    periods,
    filteredUsages,
    [],
    (u) => u.total_allocated,
  );

  return formatChart(
    component.measured_unit,
    color,
    labels,
    formattedUsages,
    formattedLimits,
    openDialog,
    component.billing_type === 'limit',
  );
};

export const getUsageHistoryPeriodOptions = (
  startDate = null,
  abbreviate = false,
) => {
  const now = DateTime.now();
  const start = parseDate(startDate);
  let totalMonths = Math.max(
    0,
    (now.year - start.year) * 12 + (now.month - start.month),
  );
  if (now.day >= start.day || totalMonths > 0) {
    totalMonths += 1;
  }
  const options: Array<{ value; label }> = [];
  if (totalMonths > 6) {
    options.push({
      value: 6,
      label: abbreviate
        ? translate('{month}M', { month: 6 })
        : translate('{month} months', { month: 6 }),
    });
  }
  if (totalMonths > 12) {
    options.push({
      value: 12,
      label: abbreviate
        ? translate('{month}M', { month: 12 })
        : translate('{month} months', { month: 12 }),
    });
  }
  options.push({ value: totalMonths, label: translate('From creation') });
  return options;
};

/**
 * Options for ComponentUsage.missing_usage_policy — what the backend records
 * for this component when the next billing period passes with no usage report.
 * Built lazily so that the labels pick up the active locale.
 */
export const getBillingTypeLabel = (value) =>
  renderFieldOrDash(
    getAccountingTypeOptions().find((option) => option.value === value)?.label,
  );

export const getTotalUsagePeriod = (
  usages: Pick<ComponentUsage, 'type' | 'billing_period'>[],
  component?: Pick<OfferingComponent, 'type'>,
) => {
  const dateObjects = usages
    .filter((record) => (component ? record.type === component.type : true))
    .map((record) => parseDate(record.billing_period));

  if (!dateObjects.length) return DASH_ESCAPE_CODE;

  const minDate = dateObjects.reduce((a, b) => (a < b ? a : b));
  const maxDate = dateObjects.reduce((a, b) => (a > b ? a : b));

  const _period = minDate.toFormat('MM/yyyy');
  if (minDate !== maxDate) {
    return _period + ` - ${maxDate.toFormat('MM/yyyy')}`;
  }
  return _period;
};

const getUsageBasedOfferingComponents = (components: OfferingComponent[]) => {
  return components
    .filter(
      (component) =>
        // Allow to report usage for limit-based components, as well as
        // prepaid one-time components (e.g. prepaid SLURM CPU/GPU) which
        // record usage but use the 'one' billing type.
        ['usage', 'limit'].includes(component.billing_type) ||
        component.is_prepaid,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getComponentsAndUsages = async (
  resource_uuid: string,
  months: number,
) => {
  if (!resource_uuid) {
    return { components: null, usages: null, userUsages: null };
  }

  let offering: PublicOfferingDetails;
  try {
    offering = await marketplaceResourcesOfferingRetrieve({
      path: { uuid: resource_uuid },
    }).then((response) => response.data);
  } catch (error) {
    if (error?.response?.status === 404) {
      return { components: [], usages: [], userUsages: [] };
    }
    throw new Error(`Error while getting offering, ${error.message}`);
  }

  const components = getUsageBasedOfferingComponents(offering.components);

  const date_after = months
    ? DateTime.now().startOf('month').minus({ months }).toFormat('yyyy-MM-dd')
    : undefined;

  try {
    const usages = await getAllPages((page) =>
      marketplaceComponentUsagesList({
        query: {
          page,
          page_size: MAX_PAGE_SIZE,
          resource_uuid,
          date_after,
          field: ['type', 'usage', 'billing_period'],
        },
      }),
    );
    const userUsages = await getAllPages((page) =>
      marketplaceComponentUserUsagesList({
        query: {
          page,
          page_size: MAX_PAGE_SIZE,
          resource_uuid,
          date_after,
          field: [
            'component_type',
            'usage',
            'billing_period',
            'username',
            'measured_unit',
          ],
        },
      }),
    );
    return { components, usages, userUsages };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { components, usages: [], userUsages: [] };
    }
    throw new Error(
      `Error while getting usages for resource: ${resource_uuid}, ${error.message}`,
    );
  }
};

export const useResourceUsageTabs = () => {
  return [
    {
      key: 'marketplace-component-usages',
      title: translate('Total usages'),
      component: lazyComponent(() =>
        import('./ResourceComponentUsageTable').then((module) => ({
          default: module.ResourceComponentUsageTable,
        })),
      ),
    },
    {
      key: 'marketplace-component-user-usages',
      title: translate('User usages'),
      component: lazyComponent(() =>
        import('./ResourceComponentUserUsageTable').then((module) => ({
          default: module.ResourceComponentUserUsageTable,
        })),
      ),
    },
  ];
};
