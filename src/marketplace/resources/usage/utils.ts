import { DateTime } from 'luxon';
import {
  PublicOfferingDetails,
  marketplaceResourcesOfferingRetrieve,
  marketplaceComponentUserUsagesList,
  marketplaceComponentUsagesList,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { parseDate } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getAccountingTypeOptions } from '@waldur/marketplace/offerings/update/components/ComponentAccountingTypeField';
import { OfferingComponent } from '@waldur/marketplace/types';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

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
  serieName: string = undefined,
  openDialog?: (details) => void,
) => ({
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
      const value = params[0].data.value;
      const description = params[0].data.description;
      const details: RowData['details'] = params[0].data.details;
      if (!value) {
        return null;
      }
      let tooltip =
        `${translate('Date')}: ${date}` +
        `<br/>${translate('Value')}: ${value}` +
        `${
          description ? `<br/>${translate('Description')}: ${description}` : ''
        }`;
      const hasMoreBtn =
        details?.length > MAX_SHOW_ITEMS + 1 && Boolean(openDialog);
      if (details?.length) {
        tooltip += `<br/><b>${translate('Details')}:</b><br/>`;
        tooltip += `<ul class="mb-0">`;
        const len = hasMoreBtn ? MAX_SHOW_ITEMS : Infinity;
        details.slice(0, len).forEach((d) => {
          tooltip += `<li>${d.username} - ${d.usage} ${d.measured_unit}</li>`;
        });
        tooltip += `</ul>`;
      }
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
        formatter: '{value}',
      },
      axisLine: { show: true },
      axisTick: { show: true },
    },
  ],
  series: [
    {
      type: 'bar',
      name: serieName,
      data: usages,
      color,
    },
  ],
});

const getMonthsPeriods = (months): DateTime[] => {
  const periods = [];
  for (let i = months - 1; i >= 0; i--) {
    periods.push(DateTime.now().minus({ months: i }));
  }
  return periods;
};

export const getFormattedUsages = (
  periods: DateTime[],
  usages: ComponentUsage[],
  userUsages: ComponentUserUsage[] = [],
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
        value: matchingUsage.usage,
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
  usages: ComponentUsage[],
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
  const labels = periods.map((date) => `${date.month} - ${date.year}`);
  return { periods, labels };
};

export const getEChartOptions = (
  component: OfferingComponent,
  usages: ComponentUsage[],
  userUsages: ComponentUserUsage[],
  months: number,
  color: string,
  openDialog?: (userUsage: ComponentUserUsage[]) => void,
) => {
  const { labels, periods } = getUsagePeriods(usages, months);
  const formattedUsages = getFormattedUsages(
    periods,
    usages.filter((usage) => usage.type === component.type),
    userUsages?.filter((usage) => usage.component_type === component.type),
  );
  return formatChart(
    component.measured_unit,
    color,
    labels,
    formattedUsages,
    component.name,
    openDialog,
  );
};

export const getUsageHistoryPeriodOptions = (startDate = null) => {
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
      label: translate('{month} months', { month: 6 }),
    });
  }
  if (totalMonths > 12) {
    options.push({
      value: 12,
      label: translate('{month} months', { month: 12 }),
    });
  }
  options.push({ value: totalMonths, label: translate('From creation') });
  return options;
};

export const getBillingTypeLabel = (value) =>
  getAccountingTypeOptions().find((option) => option.value === value)?.label ||
  'N/A';

export const getTotalUsagePeriod = (
  usages: ComponentUsage[],
  component?: OfferingComponent,
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
    .filter((component) =>
      // Allow to report usage for limit-based components
      ['usage', 'limit'].includes(component.billing_type),
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
    throw new Error(`Error while getting offering, ${error.message}`);
  }

  const components = getUsageBasedOfferingComponents(offering.components);

  const date_after = months
    ? DateTime.now().startOf('month').minus({ months }).toFormat('yyyy-MM-dd')
    : undefined;

  let usages: ComponentUsage[];
  let userUsages: ComponentUserUsage[];
  try {
    usages = await getAllPages((page) =>
      marketplaceComponentUsagesList({
        query: {
          page,
          resource_uuid,
          date_after,
          field: ['type', 'usage', 'billing_period'],
        },
      }),
    );
    userUsages = await getAllPages((page) =>
      marketplaceComponentUserUsagesList({
        query: {
          page,
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
  } catch (error) {
    throw new Error(
      `Error while getting usages for resource: ${resource_uuid}, ${error.message}`,
    );
  }

  return { components, usages, userUsages };
};

export const useResourceUsageTabs = () => {
  return [
    {
      key: 'marketplace-component-user-usages',
      title: translate('User usages'),
      component: lazyComponent(() =>
        import('./ResourceComponentUserUsageTable').then((module) => ({
          default: module.ResourceComponentUserUsageTable,
        })),
      ),
    },
    {
      key: 'marketplace-component-usages',
      title: translate('Total usages'),
      component: lazyComponent(() =>
        import('./ResourceComponentUsageTable').then((module) => ({
          default: module.ResourceComponentUsageTable,
        })),
      ),
    },
  ].filter(Boolean);
};
